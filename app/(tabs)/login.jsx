import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";

const ADMIN_EMAIL = "kadaiveedhi.admin@gmail.com";

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userOrders = [];
      querySnapshot.forEach((doc) => {
        userOrders.push({ id: doc.id, ...doc.data() });
      });
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!isLogin && !name) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      // ✅ Admin redirect
      if (userCredential.user.email === ADMIN_EMAIL) {
        router.replace("/admin");
        return;
      }

      Alert.alert("Success!", isLogin ? "Logged in successfully!" : "Account created successfully!");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("auth/email-already-in-use")) setError("Email already registered!");
      else if (msg.includes("auth/invalid-login-credentials"))
        setError("Wrong email or password!");
      else if (msg.includes("auth/weak-password"))
        setError("Password must be 6+ characters!");
      else if (msg.includes("auth/invalid-email"))
        setError("Invalid email address!");
      else setError(msg || "Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () => {
          logout();
          setEmail("");
          setPassword("");
          setName("");
          setOrders([]);
        },
      },
    ]);
  };

  if (user) {
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
            <Text style={styles.emptySub}>
              Start shopping to see orders here
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => router.push("/(tabs)/products")}
            >
              <Text style={styles.shopBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderStatus}>
                    {order.status || "Placed"}
                  </Text>
                  <Text style={styles.orderTotal}>
                    Rs.{order.total || 0}
                  </Text>
                </View>
                <Text style={styles.orderName}>
                  {order.name || ""}
                </Text>
                <Text style={styles.orderSlot}>
                  Slot: {order.selectedSlot || ""}
                </Text>
                <Text style={styles.orderAddress}>
                  {order.address || ""}
                </Text>
              </View>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.loginContainer}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>🛒</Text>
        <Text style={styles.appName}>Kadai Veedhi</Text>
        <Text style={styles.tagline}>Fresh groceries at your doorstep</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, isLogin && styles.toggleActive]}
          onPress={() => {
            setIsLogin(true);
            setError("");
          }}
        >
          <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isLogin && styles.toggleActive]}
          onPress={() => {
            setIsLogin(false);
            setError("");
          }}
        >
          <Text
            style={[styles.toggleText, !isLogin && styles.toggleTextActive]}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#aaa"
            />
          </View>
        )}
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

        <TouchableOpacity
          style={[styles.authBtn, loading && styles.authBtnDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.authBtnText}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login →"
                : "Create Account →"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
        >
          <Text style={styles.switchText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </Text>
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
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 4,
  },
  tagline: { fontSize: 14, color: "#888" },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#1A2E1A" },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#888" },
  toggleTextActive: { color: "#fff" },
  form: { gap: 16 },
  inputBox: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#1A2E1A" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#1A2E1A",
  },
  errorText: { fontSize: 13, color: "#C4622D", textAlign: "center" },
  authBtn: {
    backgroundColor: "#1A2E1A",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  authBtnDisabled: { opacity: 0.6 },
  authBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginTop: 8,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  profileIcon: { fontSize: 50, marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  profileEmail: { fontSize: 13, color: "#888", marginTop: 4 },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: "#C4622D",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  logoutText: { color: "#fff", fontWeight: "600" },
  ordersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2E1A",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyOrders: { alignItems: "center", marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  emptySub: { fontSize: 13, color: "#888", marginTop: 4, marginBottom: 16 },
  shopBtn: {
    backgroundColor: "#1A2E1A",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopBtnText: { color: "#fff", fontWeight: "600" },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderStatus: {
    backgroundColor: "#E5FFE5",
    color: "#1A2E1A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  orderTotal: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  orderName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  orderSlot: { fontSize: 12, color: "#888", marginTop: 4 },
  orderAddress: { fontSize: 12, color: "#888", marginTop: 2 },
});
