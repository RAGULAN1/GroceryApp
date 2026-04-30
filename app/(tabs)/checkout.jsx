import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../CartContext";

const slots = ["9 AM – 12 PM", "12 PM – 3 PM", "3 PM – 6 PM", "6 PM – 9 PM"];

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

  const placeOrder = () => {
    if (!name || !phone || !address || !pincode || !selectedSlot) {
      alert("Please fill in all fields and select a delivery slot!");
      return;
    }
    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      clearCart();
      setLoading(false);
      alert(
        `🎉 Order Placed Successfully!\n\nThank you ${name}!\nTotal: ₹${total}\nDelivery Slot: ${selectedSlot}\n\nYour groceries will be delivered soon!`,
      );
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.title}>Checkout</Text>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="House no, Street, Area"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Delivery Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Delivery Slot</Text>
          <View style={styles.slotsGrid}>
            {slots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotBtn,
                  selectedSlot === slot && styles.slotBtnActive,
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === slot && styles.slotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧾 Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.name} x{item.qty}
              </Text>
              <Text style={styles.orderItemPrice}>
                ₹{parseInt(item.price?.replace("₹", "") || 0) * item.qty}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={styles.orderItemName}>Subtotal</Text>
            <Text style={styles.orderItemPrice}>₹{cartTotal}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderItemName}>Delivery Fee</Text>
            <Text style={styles.orderItemPrice}>₹{delivery}</Text>
          </View>
          <View style={[styles.orderItem, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.orderBtnText}>
          {loading ? "Placing Order..." : `Place Order → ₹${total}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  backText: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  scroll: { flex: 1, paddingTop: 90 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2E1A",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 14,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#1A2E1A", marginBottom: 6 },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#1A2E1A",
    marginBottom: 12,
  },
  multiline: { height: 80, textAlignVertical: "top" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#F8F9FA",
  },
  slotBtnActive: { backgroundColor: "#1A2E1A", borderColor: "#1A2E1A" },
  slotText: { fontSize: 13, color: "#888", fontWeight: "500" },
  slotTextActive: { color: "#fff" },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderItemName: { fontSize: 14, color: "#666" },
  orderItemPrice: { fontSize: 14, color: "#1A2E1A", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  orderBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#C4622D",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
