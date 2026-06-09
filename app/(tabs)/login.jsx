import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ADMIN_EMAIL = "kadaiveedhi.admin@gmail.com";
const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";

export default function AccountScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async (uid) => {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders?key=${FIREBASE_API_KEY}`
      );
      const data = await res.json();
      const docs = (data.documents || []).filter(
        d => d.fields?.userId?.stringValue === uid
      );
      setOrders(docs.map(d => ({
        id: d.name.split("/").pop(),
        status: d.fields?.status?.stringValue || "Placed",
        total: d.fields?.total?.integerValue || 0,
        name: d.fields?.name?.stringValue || "",
        selectedSlot: d.fields?.selectedSlot?.stringValue || "",
        address: d.fields?.address?.stringValue || "",
      })));
    } catch (e) {
      console.log("orders error", e);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    try {
      const endpoint = isLogin
        ? `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
        : `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });
      const data = await res.json();

      if (data.error) {
        const msg = data.error.message || "";
        if (msg.includes("EMAIL_EXISTS")) setError("Email already registered!");
        else if (msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("INVALID_PASSWORD")) setError("Wrong email or password!");
        else if (msg.includes("WEAK_PASSWORD")) setError("Password must be 6+ characters!");
        else if (msg.includes("INVALID_EMAIL")) setError("Invalid email address!");
        else setError(msg || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (data.email === ADMIN_EMAIL) {
        router.replace("/admin");
        return;
      }

      setUser({ email: data.email, uid: data.localId, displayName: data.displayName || data.email });
      fetchOrders(data.localId);
      Alert.alert("Success!", isLogin ? "Logged in!" : "Account created!");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      { text: "Logout", onPress: () => {
        setUser(null);
        setEmail("");
        setPassword("");
        setOrders([]);
      }},
    ]);
  };

  if (user && user.email) {
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

  return (
    <ScrollView style={styles.loginContainer} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🛒</Text>
        <Text style={styles.appName}>Kadai Veedhi</Text>
        <Text style={styles.tagline}>Fresh groceries at your doorstep</Text>
      </View>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, isLogin && styles.toggleActive]} onPress={() => { setIsLogin(true); setError(""); }}>
          <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, !isLogin && styles.toggleActive]} onPress={() => { setIsLogin(false); setError(""); }}>
          <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#aaa" />
          </View>
        )}
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#aaa" />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput style={styles.input} placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#aaa" />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={[styles.authBtn, loading && styles.authBtnDisabled]} onPress={handleAuth} disabled={loading}>
          <Text style={styles.authBtnText}>{loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(""); }}>
          <Text style={styles.switchText}>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  loginContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  content: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 32, fontWeight: "bold", color: "#1A2E1A", marginBottom: 4 },
  tagline: { fontSize: 14, color: "#888" },
  toggleRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: "#eee" },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  toggleActive: { backgroundColor: "#1A2E1A" },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#888" },
  toggleTextActive: { color: "#fff" },
  form: { gap: 16 },
  inputBox: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#1A2E1A" },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1, borderColor: "#eee", color: "#1A2E1A" },
  errorText: { fontSize: 13, color: "#C4622D", textAlign: "center" },
  authBtn: { backgroundColor: "#1A2E1A", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  authBtnDisabled: { opacity: 0.6 },
  authBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  switchText: { textAlign: "center", fontSize: 13, color: "#888", marginTop: 8 },
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
