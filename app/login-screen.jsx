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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications, saveAdminPushToken } from "./notifications";

const ADMIN_EMAIL = "kadaiveedhi.admin@gmail.com";
const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveUserToFirestore = async (uid, email, displayName) => {
    try {
      await fetch(`${BASE_URL}/users/${uid}?key=${FIREBASE_API_KEY}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: uid },
            email: { stringValue: email },
            displayName: { stringValue: displayName || email },
            lastLogin: { stringValue: new Date().toISOString() },
          }
        }),
      });
    } catch (e) {}
  };

  const handleAuth = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (!isLogin && !name) { setError("Please enter your name"); return; }
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
        const adminData = { email: data.email, uid: data.localId, displayName: "Admin", isAdmin: true };
        await AsyncStorage.setItem("kadai_admin", JSON.stringify(adminData));
      await AsyncStorage.removeItem("kadai_user");
        const token = await registerForPushNotifications();
        if (token) await saveAdminPushToken(token);
        router.replace("/admin");
        return;
      }

      const userData = { email: data.email, uid: data.localId, displayName: name || data.displayName || data.email, isAdmin: false };
      await saveUserToFirestore(data.localId, data.email, name || data.displayName);
      await AsyncStorage.setItem("kadai_user", JSON.stringify(userData));
      await AsyncStorage.removeItem("kadai_admin");
      await AsyncStorage.removeItem("kadai_admin");
      router.replace("/(tabs)");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
            <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} placeholderTextColor="#aaa" />
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
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
});




