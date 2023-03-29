import { Entypo } from '@expo/vector-icons';
import { Heading, HStack, Icon, Image, Text, VStack } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {

}

export function ExerciseCard({ ...rest }: Props) {
  return (
    <TouchableOpacity {...rest}>
      <HStack bg="gray.500" alignItems="center" p={2} pr={4} rounded="md" mb={3}>
        <Image
          source={{ uri: 'https://cdn.fisiculturismo.com.br/monthly_2017_03/puxada-pela-frente-pronada-intermediaria.jpg.ca8dc190ce67b081cce730d04d30e18e.jpg' }}
          w={16}
          h={16}
          rounded="md"
          alt="Imagem do exercício"
          mr={4}
          resizeMode="cover"
        />
        <VStack flex={1}>
          <Heading color="white" fontSize="lg">Puxada frontal</Heading>
          <Text color="gray.200" fontSize="sm" mt={1} numberOfLines={2}>3 séries x 12 repetições</Text>
        </VStack>

        <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
      </HStack>
    </TouchableOpacity>
  )
}