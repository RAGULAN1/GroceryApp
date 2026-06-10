import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { registerForPushNotifications } from "./notifications";

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkLogin();
    registerForPushNotifications();
  }, []);

  const checkLogin = async () => {
    try {
      const adminSaved = await AsyncStorage.getItem("kadai_admin");
      if (adminSaved) { setInitialRoute("admin"); return; }
      const userSaved = await AsyncStorage.getItem("kadai_user");
      if (userSaved) { setInitialRoute("tabs"); return; }
      setInitialRoute("login");
    } catch (e) {
      setInitialRoute("login");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!checking && initialRoute) {
      if (initialRoute === "admin") {
        router.replace("/admin");
      } else if (initialRoute === "tabs") {
        router.replace("/(tabs)");
      } else {
        router.replace("/login-screen");
      }
    }
  }, [checking, initialRoute]);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FA" }}>
        <Text style={{ fontSize: 50, marginBottom: 16 }}>🛒</Text>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1A2E1A" }}>Kadai Veedhi</Text>
        <ActivityIndicator size="large" color="#1A2E1A" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login-screen" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="product-detail" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}


