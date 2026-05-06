import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import SearchScreen from "./screens/SearchScreen.jsx";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen
            name="product-detail"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
