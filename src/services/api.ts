import axios, { AxiosInstance } from "axios";
import { AppError } from './../utils/AppError';

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}


const api = axios.create({
  baseURL: 'http://10.0.0.143:3333'
}) as APIInstanceProps;

/*

api.interceptors.request.use((config) => {
  console.log("DADOS ENVIADOS", config.data)
  return config;
}, (error) => {
  return Promise.reject(error);
})

*/

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use(response => response, error => {
    if (error.response && error.response.data) {
      return Promise.reject(new AppError(error.response.data.message));
    } else {
      return Promise.reject(error)
    }
  });

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};



export { api };
