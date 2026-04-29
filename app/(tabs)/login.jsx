import { useRouter } from "expo-router";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace("/(tabs)");
    } catch (err) {
      if (err.code === "auth/invalid-credential")
        setError("Wrong email or password");
      else if (err.code === "auth/email-already-in-use")
        setError("Email already registered");
      else if (err.code === "auth/weak-password")
        setError("Password must be 6+ characters");
      else setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🛒</Text>
        <Text style={styles.appName}>Kadai Veedhi</Text>
        <Text style={styles.tagline}>Fresh groceries at your doorstep</Text>
      </View>

      {/* Toggle */}
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

      {/* Form */}
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
  container: { flex: 1, backgroundColor: "#F8F9FA" },
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
});
