import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import "intl";
import "intl/locale-data/jsonp/pt-BR";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { ThemeProvider } from "styled-components";
import theme from "./src/global/styles/theme";

import { AuthProvider, useAuth } from "./src/hooks/auth";
import { Routes } from "./src/routes";
export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [loading, setLoading] = useState(true);

  const initApplication = async () => {
    SplashScreen.preventAutoHideAsync();
    // await loadImages();

    setLoading(false);
    SplashScreen.hideAsync();
  };
  const { userStorageLoading } = useAuth();
  useEffect(() => {
    initApplication();
  }, []);

  if (!fontsLoaded || userStorageLoading) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}
