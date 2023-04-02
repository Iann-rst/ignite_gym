import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { createContext, ReactNode, useEffect, useState } from "react";


import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";


export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  isLoadingUserStorageData: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)


export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);


  function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData)
  }

  async function storageUserAndTokenSave(userData: UserDTO, token: string) {
    try {
      setIsLoadingUserStorageData(true)
      await storageUserSave(userData)
      await storageAuthTokenSave(token)

    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false)
    }

  }

  // Logar na aplicação
  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', { email, password });

      if (data.user && data.token) {
        setIsLoadingUserStorageData(true);
        await storageUserAndTokenSave(data.user, data.token)

        userAndTokenUpdate(data.user, data.token);

      }
    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false)

    }
  }

  // Recuperar usuário logado
  async function loadUserDate() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet()
      const token = await storageAuthTokenGet()

      if (userLogged && token) {
        userAndTokenUpdate(userLogged, token)
      }

    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  // Deslogar usuário da aplicação
  async function signOut() {
    try {

      setIsLoadingUserStorageData(true);

      setUser({} as UserDTO)

      await storageUserRemove()
      await storageAuthTokenRemove()

    } catch (error) {

      throw error;

    } finally {

      setIsLoadingUserStorageData(false);

    }
  }

  // Atualizar usuário no storage
  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser(userUpdated)
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    loadUserDate()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      isLoadingUserStorageData,
      signOut,
      updateUserProfile
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}