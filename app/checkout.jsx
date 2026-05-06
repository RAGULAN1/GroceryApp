import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
import { useCart } from "../CartContext";
import { db } from "../firebaseConfig";

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
      Alert.alert(
        "Missing Fields",
        "Please fill in all fields and select a delivery slot!",
      );
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: "user123", // Replace with actual user ID
        items: cartItems,
        total: total,
        deliveryFee: delivery,
        deliverySlot: selectedSlot,
        customerInfo: { name, phone, address, pincode },
        status: "pending",
        createdAt: serverTimestamp(),
      });

      clearCart();
      Alert.alert("Order Placed!", "Your order has been placed successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error) {
      console.error("Order error:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty!</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/products")}
          >
            <Text style={styles.shopBtnText}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Checkout 🛒</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Slot</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.qty}</Text>
            <Text style={styles.itemPrice}>
              ₹{parseInt(item.price?.replace("₹", "") || 0) * item.qty}
            </Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{cartTotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>₹{delivery}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderBtn, loading && styles.btnDisabled]}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderText}>
          {loading ? "Placing Order..." : `Place Order → ₹${total}`}
        </Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2E1A",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotBtn: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  slotBtnActive: { borderColor: "#1A2E1A", backgroundColor: "#E8F5E8" },
  slotText: { fontSize: 12, color: "#555" },
  slotTextActive: { color: "#1A2E1A", fontWeight: "600" },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: { flex: 1, fontSize: 14, color: "#1A2E1A" },
  itemQty: { fontSize: 12, color: "#888", marginHorizontal: 8 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: "#C4622D" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#888" },
  summaryValue: { fontSize: 14, color: "#1A2E1A", fontWeight: "500" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  placeOrderBtn: {
    backgroundColor: "#1A2E1A",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  shopBtn: {
    backgroundColor: "#1A2E1A",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  shopBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
