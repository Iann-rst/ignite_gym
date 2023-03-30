import { Roboto_400Regular, Roboto_700Bold, useFonts } from '@expo-google-fonts/roboto';
import { Routes } from '@routes/index';
import { NativeBaseProvider } from 'native-base';
import { StatusBar } from 'react-native';

import { AuthContextProvider } from '@contexts/AuthContext';

import { Loading } from './src/components/Loading';

import { THEME } from './src/theme';


export default function App() {
  let [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_400Regular
  })

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AuthContextProvider>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
