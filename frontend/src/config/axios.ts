import axios, { AxiosRequestConfig } from 'axios';
import {jwtDecode} from 'jwt-decode';
import NavigateService from '../services/navigate';
import useUserStore from '@/hooks/useUserStore';
import Cookies from 'js-cookie';
import { API_URL } from '.';

const request = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
});

const refreshRequest = axios.create({
  baseURL: API_URL,
  withCredentials:true
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Axios Error",error.response)

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response=await getNewTokenByRefreshToken();
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/api/refresh-token', { refreshToken });
        // const { token } = response.data;

        // localStorage.setItem('token', token);

        // Retry the original request with the new token
        // originalRequest.headers.Authorization = `Bearer ${token}`;
        if (response.status != 201) {
          return Promise.reject(response);
        }
        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token error or redirect to login
      }
    }

    return Promise.reject(error);
  }
);

// request.interceptors.request.use(
//   (requestConfig: any) => {
//     const token  =  Cookies.get('token');

//     if (token && token !== null && token !== '' && token !=="undefined" && token !==undefined) {
//       console.log("token :",token)
//       if (!isExpiredToken(token)) {
//         //TODO: if the token is not expired 
//         requestConfig.headers.Authorization = `Bearer ${token}`;
//       } else {
//         return resetTokenAndReattemptRequest(requestConfig);
//       }
//     }
//     return requestConfig;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

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
 // const { refreshToken: resetToken = null } =  useUserStore.getState()?.user;
  const resetToken=useUserStore.getState().user?.refreshToken;
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
      // const response = await refreshRequest.post(`auth/refresh_token`, {
      //   token: resetToken,
      // });
      const response=await getNewTokenByRefreshToken()

      if (!response.data) {
        return Promise.reject(response);
      }
      const { token, refreshToken } = response.data;
     useUserStore.getState().updateUserTokens(token, refreshToken)
      isAlreadyFetchingAccessToken = false;
      onAccessTokenFetched(token);
    }

    return retryOriginalRequest;
  } catch (err) {
    // make sure we don't lock any upcoming request in case of a refresh error
    isAlreadyFetchingAccessToken = false;
    useUserStore.getState().clearUserStore();
    NavigateService.navigate('/');
    return Promise.reject(err);
  }
};

const getNewTokenByRefreshToken=async()=>{
  const response = await refreshRequest.get(`auth/refresh_token`);
  return response;
}

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

export { request, getNewTokenByRefreshToken };
