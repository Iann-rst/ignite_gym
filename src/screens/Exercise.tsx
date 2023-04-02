import { useEffect, useState } from "react";

import { Box, Heading, HStack, Icon, Image, ScrollView, Text, useToast, VStack } from "native-base";
import { TouchableOpacity } from "react-native";

import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";

import BodySvg from '@assets/body.svg';
import RepetitionsSvg from '@assets/repetitions.svg';
import SeriesSvg from '@assets/series.svg';

import { Button } from "@components/Button";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

type RoutesParamsProps = {
  exerciseId: string
}

export function Exercise() {
  const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)
  const route = useRoute();
  const { exerciseId } = route.params as RoutesParamsProps;
  const toast = useToast()

  const { goBack } = useNavigation()

  function handleGoBack() {
    goBack();
  }

  async function fetchExerciseDetails() {
    try {
      const response = await api.get(`/exercises/${exerciseId}`)
      setExercise(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError

      const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.'

      toast.show({
        title,
        bgColor: 'red.500',
        placement: 'top',
        _title: {
          textAlign: 'center'
        }
      })
    }
  }

  useEffect(() => {
    fetchExerciseDetails()
  }, [exerciseId])

  return (
    <VStack flex={1}>

      <VStack px={8} bg="gray.600" pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
        </TouchableOpacity>

        <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
          <Heading color="gray.100" fontSize="lg" fontFamily="heading" flexShrink={1}>
            {exercise.name}
          </Heading>

          <HStack alignItems="center">
            <BodySvg />
            <Text color="gray.200" ml={1} textTransform="capitalize">
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      <ScrollView>
        <VStack p={8}>
          <Box rounded="lg" mb={3} overflow="hidden">
            <Image
              w="full"
              h={80}
              source={{
                uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`
              }}
              alt="Nome do exercício"
              resizeMode="cover"
            />
          </Box>


          <Box bg="gray.600" rounded="md" pb={4} px={4}>
            <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
              <HStack>
                <SeriesSvg />
                <Text color="gray.200" ml="2">{exercise.series} séries</Text>
              </HStack>

              <HStack>
                <RepetitionsSvg />
                <Text color="gray.200" ml="2">{exercise.repetitions} repetições</Text>
              </HStack>
            </HStack>

            <Button title="Marcar como finalizado" />
          </Box>

        </VStack>
      </ScrollView>
    </VStack>
  )
}