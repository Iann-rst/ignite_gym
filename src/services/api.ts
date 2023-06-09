import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";
import axios, { AxiosError, AxiosInstance } from "axios";
import { AppError } from './../utils/AppError';

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}


const api = axios.create({
  baseURL: 'http://10.0.0.143:3333'
}) as APIInstanceProps;



// fila de requisição
let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use(response => response, async (requestError) => {

    // verificar se o error é por conta de um token inválido ou expirado
    if (requestError?.response?.status === 401) {
      if (requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
        const { refresh_token } = await storageAuthTokenGet();

        if (!refresh_token) {
          signOut();
          return Promise.reject(requestError);
        }

        const originalRequestConfig = requestError.config;

        // implementar fila de requisição
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              onSuccess: (token: string) => {
                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                resolve(api(originalRequestConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              }
            })
          })
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            // buscar o novo token
            const { data } = await api.post('/sessions/refresh-token', { refresh_token });

            // salva no storageAuth
            await storageAuthTokenSave(data.token, data.refresh_token)


            if (originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
            }

            // Adiciona o token no cabeçalho das requisições
            originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            // reenvia a requisição
            failedQueue.forEach(request => {
              request.onSuccess(data.token)
            })

            console.log("TOKEN ATUALIZADO")

            resolve(api(originalRequestConfig));

          } catch (error: any) {
            failedQueue.forEach(request => {
              request.onFailure(error);
            });

            signOut();
            reject(error);
          } finally {
            isRefreshing = false;
            failedQueue = [];
          }
        })
      }

      signOut();
    }


    if (requestError.response && requestError.response.data) {
      return Promise.reject(new AppError(requestError.response.data.message));
    } else {
      return Promise.reject(requestError)
    }
  });

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};



export { api };
