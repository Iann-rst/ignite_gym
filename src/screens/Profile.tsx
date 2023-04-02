import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { Center, Heading, ScrollView, Skeleton, Text, useToast, VStack } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { Button } from "@components/Button";
import { Input } from '@components/Input';
import { ScreenHeader } from "@components/ScreenHeader";
import { UserAvatar } from "@components/UserAvatar";
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import defaultUserPhotoImg from '@assets/userPhotoDefault.png';


const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  confirm_password: string;
}

/* Schema de validação com Zod */
const profileSchema = yup.object({
  name: yup
    .string()
    .required('Informe o nome.'),

  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 dígitos.')
    .nullable()
    .transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
    .when('password', {
      is: (field: any) => field,
      then: (schema) => schema
        .nullable()
        .required('Informe a confirmação da senha.')
        .transform((value) => !!value ? value : null)
    }),
})


export function Profile() {
  const { user, updateUserProfile } = useAuth()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false)


  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email
    },
    resolver: yupResolver(profileSchema)
  })


  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsLoading(true);
      const userUpdated = user;

      userUpdated.name = data.name;

      await api.put('/users', data);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Atualizado com sucesso',
        placement: 'top',
        bgColor: "green.500"
      })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível atualizar as informações.'

      toast.show({
        title,
        placement: 'top',
        bgColor: "red.500",
        _title: {
          textAlign: 'center'
        }
      })

    } finally {
      setIsLoading(false)
    }
  }


  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri, { size: true })

        if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 10) {
          return toast.show({
            title: 'Essa imagem é muito grande. Escolha uma de até 10MB.',
            placement: 'top',
            bgColor: 'red.500'
          })
        }

        //setUserPhoto(photoSelected.assets[0].uri)

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}.${fileExtension}`.toLowerCase().replace(' ', '-'),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`
        } as any;
        //console.log(photoFile)

        const userPhotoUploadForm = new FormData();

        userPhotoUploadForm.append('avatar', photoFile);

        const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar;
        updateUserProfile(userUpdated);

        //console.log(userUpdated)

        toast.show({
          title: 'Foto atualizada!',
          placement: 'top',
          bgColor: 'green.500'
        });
      }


    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>

          {
            photoIsLoading ?
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded="full"
                startColor="gray.500"
                endColor="gray.400"
              />
              :
              <UserAvatar
                source={
                  user.avatar
                    ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                    : defaultUserPhotoImg
                }
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={3} mb={8}>Alterar foto</Text>
          </TouchableOpacity>


          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                bg="gray.600"
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
                bg="gray.600"
                placeholder="E-mail"
                isDisabled
                onChangeText={onChange}
                value={value}
                isReadOnly
              />
            )}
          />

        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color="gray.100" fontSize="md" fontFamily="heading" mb={2}>Alterar senha</Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.old_password?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />


          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )} />


          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isLoading}
          />
        </VStack>

      </ScrollView>
    </VStack>
  )
}