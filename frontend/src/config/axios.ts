import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import NavigateService from "../services/navigate";
import useUserStore from "@/hooks/useUserStore";
import Cookies from "js-cookie";
import { API_URL } from ".";

const request = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
});

const refreshRequest = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let subscribers: any[] = [];
let isAlreadyFetchingAccessToken = false;

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      resetTokenAndReattemptRequest(originalRequest);
      try {
        if (!isAlreadyFetchingAccessToken) {
          isAlreadyFetchingAccessToken = true;
          const response = await getNewTokenByRefreshToken();
          if (response.status === 201) {
            isAlreadyFetchingAccessToken = false;
            onAccessTokenFetched();
            return axios(originalRequest);
          }
          return Promise.reject(response);
        }
      } catch (error) {
        NavigateService.navigate("/"); //TODO: navigate to login page if we change the url
      }
    }

    return Promise.reject(error);
  }
);

const resetTokenAndReattemptRequest = async (
  requestConfig: AxiosRequestConfig,
  requestType: "req" | "res" = "req"
): Promise<AxiosRequestConfig> => {
  console.log("--- WARNING: JWT Timeout - Refreshing! ---");

  try {
    const retryOriginalRequest = new Promise<AxiosRequestConfig>(
      requestResolverBuilder(requestType)(requestConfig)
    );

    return retryOriginalRequest;
  } catch (err) {
    // make sure we don't lock any upcoming request in case of a refresh error
    isAlreadyFetchingAccessToken = false;
    useUserStore.getState().clearUserStore();
    NavigateService.navigate("/");
    return Promise.reject(err);
  }
};

const getNewTokenByRefreshToken = async () => {
  const response = await refreshRequest.get(`auth/refresh_token`);
  return response;
};

const requestResolverBuilder =
  (type: "req" | "res") => (requestConfig: any) => (resolve: any) => {
    /* We need to add the request retry to the queue
  since there another request that already attempt to
  refresh the token */
    addSubscriber(() => {
      resolve(type === "req" ? requestConfig : axios(requestConfig));
    });
  };

const onAccessTokenFetched = () => {
  // When the refresh is successful, we start retrying the requests one by one and empty the queue
  subscribers.forEach((cb) => cb());
  subscribers = [];
};

const addSubscriber = (cb: () => void) => subscribers.push(cb);

export { request, getNewTokenByRefreshToken };
