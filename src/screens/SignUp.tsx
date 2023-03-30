import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from "@react-navigation/native";
import { Center, Heading, Image, ScrollView, Text, useToast, VStack } from "native-base";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@hooks/useAuth';


import { api } from '@services/api';
import { AppError } from '@utils/AppError';


import BackGroundImg from '@assets/background.png';
import LogoSvg from "@assets/logo.svg";
import { Button } from "@components/Button";
import { Input } from "@components/Input";


type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

// schema de validação do formulário com o Zod
const schemaValidation = z.object({
  name: z.string({
    required_error: 'Informe o nome.'
  }).trim().nonempty({
    message: 'Informe o nome.'
  }),

  email: z.string({
    required_error: 'Informe o email.'
  }).email('E-mail inválido.'),

  password: z.string({
    required_error: 'Informe a senha.'
  }).min(6, 'A senha deve ter pelo menos 6 dígitos.'),

  password_confirm: z.string({
    required_error: 'Confirme a senha.'
  }).min(6, 'A senha deve ter pelo menos 6 dígitos.')

}).refine((data) => data.password === data.password_confirm, {
  path: ["password_confirm"],
  message: "Senhas diferentes"
})

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()


  const { goBack } = useNavigation();

  const toast = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: zodResolver(schemaValidation)
  });

  function handleGoBack() {
    goBack()
  }

  async function handleSignUp({ name, email, password }: FormDataProps) {
    try {
      setIsLoading(true);

      await api.post('/users', { name, email, password })
      await signIn(email, password);

    } catch (error) {
      setIsLoading(false);

      const isAppError = error instanceof AppError;

      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        _title: { textAlign: 'center' }
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
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />


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
                errorMessage={errors.password?.message}
              />
            )} />


          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirme a senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )} />


          <Button
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
            isLoading={isLoading}
          />

        </Center>

        <Button
          title="Voltar para o login"
          variant="outline"
          mt={12}
          onPress={handleGoBack}
        />
      </VStack>
    </ScrollView>
  )
}