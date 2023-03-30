import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from "@react-navigation/native";
import { Center, Heading, Image, ScrollView, Text, useToast, VStack } from "native-base";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';


/*hook de autenticação */
import { useAuth } from '@hooks/useAuth';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import BackGroundImg from '@assets/background.png';
import LogoSvg from "@assets/logo.svg";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { AppError } from '@utils/AppError';


type FormDataProps = {
  email: string;
  password: string;
}

/* Schema de validação utilizando zod */
const schemaValidation = z.object({
  email: z.string({
    required_error: 'Informe o email.'
  }).email('E-mail inválido.'),

  password: z.string({
    required_error: 'Informe a senha.'
  }).min(6, 'A senha deve ter pelo menos 6 dígitos.'),
})


export function SignIn() {

  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: zodResolver(schemaValidation)
  })

  const { navigate } = useNavigation<AuthNavigatorRoutesProps>();
  const { signIn } = useAuth();
  const toast = useToast();


  function handleNewAccount() {
    navigate("signUp")
  }

  async function handleSignIn({ email, password }: FormDataProps) {
    try {
      setIsLoading(true)

      await signIn(email, password);

    } catch (error) {

      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.'

      setIsLoading(false);

      /** Alert personalizado **/
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })

    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackGroundImg}
          defaultSource={BackGroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">Acesse sua conta</Heading>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignIn)}
                returnKeyType="send"
                errorMessage={errors.password?.message}
              />
            )} />


          <Button
            title="Acessar"
            onPress={handleSubmit(handleSignIn)}
            isLoading={isLoading}
          />
        </Center>

        <Center mt={24}>
          <Text
            color="gray.100"
            fontSize="sm"
            mb={3}
            fontFamily="body"
          >
            Ainda não tem acesso?
          </Text>
          <Button
            title="Criar conta"
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  )
}