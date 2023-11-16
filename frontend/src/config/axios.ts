import axios, { AxiosRequestConfig } from 'axios';
import {jwtDecode} from 'jwt-decode';
import NavigateService from '../services/navigate';
import StorageService from '../services/storage';

import { API_URL } from '.';

const request = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

const refreshRequest = axios.create({
  baseURL: API_URL,
});

request.interceptors.request.use(
  (requestConfig: any) => {
    const { token } = StorageService.getAuthData();

    if (token && token !== null && token !== '') {
      if (!isExpiredToken(token)) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      } else {
        return resetTokenAndReattemptRequest(requestConfig);
      }
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const isExpiredToken = (token: string = '') => {
  try {
    /* in case the call succeeds at the end of timeout,
    remove the amount of timeout from our current time
    to avoid 401 from server */
    const tokenExpiration = (jwtDecode(token) as any).exp - 40;
    const currentTime = Date.now().valueOf() / 1000;

    return tokenExpiration < currentTime;
  } catch {
    return false;
  }
};

let subscribers: any[] = [];
let isAlreadyFetchingAccessToken = false;

const resetTokenAndReattemptRequest = async (
  requestConfig: AxiosRequestConfig,
  requestType: 'req' | 'res' = 'req',
): Promise<AxiosRequestConfig> => {
  console.log('--- WARNING: JWT Timeout - Refreshing! ---');
  const { refreshToken: resetToken = '' } = StorageService.getAuthData();
  try {
    if (!resetToken) {
      const reason = `Couldn't find refresh token!`;
      return Promise.reject(reason);
    }

    const retryOriginalRequest = new Promise<AxiosRequestConfig>(requestResolverBuilder(requestType)(requestConfig));

    if (!isAlreadyFetchingAccessToken) {
      /* If there is no previous call to refresh the Auth token,
      make the request. Update the value to the check so that no
      other call can be made concurrently.*/
      isAlreadyFetchingAccessToken = true;
      const response = await refreshRequest.post(`/refresh_token`, {
        token: resetToken,
      });

      if (!response.data) {
        return Promise.reject(response);
      }
      const { token, refreshToken } = response.data;
      StorageService.setAuthData(token, refreshToken);
      isAlreadyFetchingAccessToken = false;
      onAccessTokenFetched(token);
    }

    return retryOriginalRequest;
  } catch (err) {
    // make sure we don't lock any upcoming request in case of a refresh error
    isAlreadyFetchingAccessToken = false;
    StorageService.clearUserData();
    NavigateService.navigate('/');
    return Promise.reject(err);
  }
};

const requestResolverBuilder = (type: 'req' | 'res') => (requestConfig: any) => (resolve: any) => {
  /* We need to add the request retry to the queue
  since there another request that already attempt to
  refresh the token */
  addSubscriber((authToken: string) => {
    requestConfig.headers.Authorization = 'Bearer ' + authToken;
    resolve(type === 'req' ? requestConfig : axios(requestConfig));
  });
};

const onAccessTokenFetched = (authToken: string) => {
  // When the refresh is successful, we start retrying the requests one by one and empty the queue
  subscribers.forEach((cb) => cb(authToken));
  subscribers = [];
};

const addSubscriber = (cb: (authToken: string) => void) => subscribers.push(cb);

export { request };
