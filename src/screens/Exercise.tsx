import { Box, Heading, HStack, Icon, Image, ScrollView, Text, VStack } from "native-base";
import { TouchableOpacity } from "react-native";

import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

import BodySvg from '@assets/body.svg';
import RepetitionsSvg from '@assets/repetitions.svg';
import SeriesSvg from '@assets/series.svg';
import { Button } from "@components/Button";


export function Exercise() {
  const { goBack } = useNavigation()

  function handleGoBack() {
    goBack();
  }

  return (
    <VStack flex={1}>

      <VStack px={8} bg="gray.600" pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
        </TouchableOpacity>

        <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
          <Heading color="gray.100" fontSize="lg" fontFamily="heading" flexShrink={1}>
            Puxada Frontal
          </Heading>

          <HStack alignItems="center">
            <BodySvg />
            <Text color="gray.200" ml={1} textTransform="capitalize">
              Costa
            </Text>
          </HStack>
        </HStack>
      </VStack>

      <ScrollView>
        <VStack p={8}>
          <Image
            w="full"
            h={80}
            source={{
              uri: 'https://cdn.fisiculturismo.com.br/monthly_2017_03/puxada-pela-frente-pronada-intermediaria.jpg.ca8dc190ce67b081cce730d04d30e18e.jpg'
            }}
            alt="Nome do exercício"
            mb={3}
            resizeMode="cover"
            overflow="hidden"
            rounded="lg"
          />


          <Box bg="gray.600" rounded="md" pb={4} px={4}>
            <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
              <HStack>
                <SeriesSvg />
                <Text color="gray.200" ml="2">3 séries</Text>
              </HStack>

              <HStack>
                <RepetitionsSvg />
                <Text color="gray.200" ml="2">12 repetições</Text>
              </HStack>
            </HStack>

            <Button title="Marcar como finalizado" />
          </Box>

        </VStack>
      </ScrollView>
    </VStack>
  )
}