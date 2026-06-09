import { Stack } from "expo-router";
import { useEffect } from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { registerForPushNotifications } from "./notifications";

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) console.log("Push token:", token);
    });
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="product-detail" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
