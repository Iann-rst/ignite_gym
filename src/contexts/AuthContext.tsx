import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { storageUserGet, storageUserSave } from "@storage/storageUser";
import { createContext, ReactNode, useEffect, useState } from "react";


export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)


export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);


  // Logar na aplicação
  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', { email, password });

      if (data.user) {
        setUser(data.user)
        storageUserSave(data.user);
      }
    } catch (error) {
      throw error;

    }
  }

  // Recuperar usuário logado
  async function loadUserDate() {
    const userLogged = await storageUserGet()

    if (userLogged) {
      setUser(userLogged)
    }
  }

  useEffect(() => {
    loadUserDate()
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}