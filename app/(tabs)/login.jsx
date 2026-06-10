import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const saved = await AsyncStorage.getItem("kadai_user");
      if (saved) {
        const userData = JSON.parse(saved);
        setUser(userData);
        fetchOrders(userData.uid);
      }
    } catch (e) {}
  };

  const fetchOrders = async (uid) => {
    try {
      const res = await fetch(`${BASE_URL}/orders?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      const docs = (data.documents || []).filter(d => d.fields?.userId?.stringValue === uid);
      setOrders(docs.map(d => ({
        id: d.name.split("/").pop(),
        status: d.fields?.status?.stringValue || "Placed",
        total: d.fields?.total?.integerValue || 0,
        name: d.fields?.name?.stringValue || "",
        selectedSlot: d.fields?.selectedSlot?.stringValue || "",
        address: d.fields?.address?.stringValue || "",
      })));
    } catch (e) {}
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await AsyncStorage.removeItem("kadai_user");
        router.replace("/login-screen");
      }},
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FA" }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>👤</Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1A2E1A", marginBottom: 8 }}>Not logged in</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace("/login-screen")}>
          <Text style={styles.loginBtnText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileIcon}>👤</Text>
        <Text style={styles.profileName}>{user.displayName || user.email}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.ordersTitle}>My Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>No orders yet!</Text>
          <Text style={styles.emptySub}>Start shopping to see orders here</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push("/(tabs)/products")}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderStatus}>{order.status}</Text>
                <Text style={styles.orderTotal}>Rs.{order.total}</Text>
              </View>
              <Text style={styles.orderName}>{order.name}</Text>
              <Text style={styles.orderSlot}>Slot: {order.selectedSlot}</Text>
              <Text style={styles.orderAddress}>{order.address}</Text>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  loginBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  loginBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  profileHeader: { alignItems: "center", padding: 24, backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#eee" },
  profileIcon: { fontSize: 50, marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  profileEmail: { fontSize: 13, color: "#888", marginTop: 4 },
  logoutBtn: { marginTop: 12, backgroundColor: "#C4622D", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8 },
  logoutText: { color: "#fff", fontWeight: "600" },
  ordersTitle: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A", paddingHorizontal: 20, marginBottom: 12 },
  emptyOrders: { alignItems: "center", marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  emptySub: { fontSize: 13, color: "#888", marginTop: 4, marginBottom: 16 },
  shopBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: "#fff", fontWeight: "600" },
  orderCard: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  orderStatus: { backgroundColor: "#E5FFE5", color: "#1A2E1A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: "600" },
  orderTotal: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  orderName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  orderSlot: { fontSize: 12, color: "#888", marginTop: 4 },
  orderAddress: { fontSize: 12, color: "#888", marginTop: 2 },
});
