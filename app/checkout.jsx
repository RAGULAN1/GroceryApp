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
import { useCart } from "./CartContext";
import { sendLocalNotification } from "./notifications";

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const slots = ["9 AM - 12 PM", "12 PM - 3 PM", "3 PM - 6 PM", "6 PM - 9 PM"];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const delivery = 40;
  const total = cartTotal + delivery;

  const placeOrder = async () => {
    if (!name || !phone || !address || !pincode || !selectedSlot) {
      Alert.alert("Missing Fields", "Please fill in all fields!");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        fields: {
          name: { stringValue: name },
          phone: { stringValue: phone },
          address: { stringValue: address },
          pincode: { stringValue: pincode },
          selectedSlot: { stringValue: selectedSlot },
          total: { integerValue: total },
          deliveryFee: { integerValue: delivery },
          status: { stringValue: "Placed" },
          items: { stringValue: JSON.stringify(cartItems) },
        }
      };

      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      if (res.ok) {
        clearCart();
      await sendLocalNotification("Order Placed! 🎉", "Your order has been placed successfully! We will deliver soon.");
        Alert.alert("Order Placed!", "Your order has been placed successfully!", [
          { text: "OK", onPress: () => router.push("/(tabs)") },
        ]);
      } else {
        const err = await res.json();
        Alert.alert("Error", err.error?.message || "Failed to place order!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} placeholder="10-digit mobile number" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
        <Text style={styles.label}>Street Address *</Text>
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Door no, Street, Landmark" placeholderTextColor="#aaa" value={address} onChangeText={setAddress} multiline textAlignVertical="top" />
        <Text style={styles.label}>Pincode *</Text>
        <TextInput style={styles.input} placeholder="6-digit pincode" placeholderTextColor="#aaa" value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Slot</Text>
        <View style={styles.slotsGrid}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slotBtn, selectedSlot === slot && styles.slotBtnActive]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.qty}</Text>
            <Text style={styles.itemPrice}>Rs.{parseInt(String(item.price || "0").replace("Rs.", "").trim()) * item.qty}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text>Rs.{cartTotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text>Rs.{delivery}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs.{total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderBtn, loading && styles.btnDisabled]}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderText}>{loading ? "Placing Order..." : "Place Order - Rs." + total}</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A", paddingHorizontal: 20, marginBottom: 16 },
  section: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#444", marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 14, color: "#222", backgroundColor: "#fafafa" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotBtn: { flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, alignItems: "center" },
  slotBtnActive: { borderColor: "#1A2E1A", backgroundColor: "#E8F5E8" },
  slotText: { fontSize: 12, color: "#555" },
  slotTextActive: { color: "#1A2E1A", fontWeight: "600" },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  itemName: { flex: 1, fontSize: 14, color: "#1A2E1A" },
  itemQty: { fontSize: 12, color: "#888", marginHorizontal: 8 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: "#C4622D" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: "#888" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  placeOrderBtn: { backgroundColor: "#1A2E1A", borderRadius: 16, padding: 18, alignItems: "center", marginHorizontal: 20, marginBottom: 20 },
  btnDisabled: { opacity: 0.6 },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

