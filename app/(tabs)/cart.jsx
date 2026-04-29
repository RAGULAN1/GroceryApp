import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 40,
      unit: "per kg",
      emoji: "🍅",
      qty: 2,
    },
    {
      id: 2,
      name: "Whole Milk",
      price: 60,
      unit: "per litre",
      emoji: "🥛",
      qty: 1,
    },
    {
      id: 3,
      name: "Brown Bread",
      price: 45,
      unit: "per pack",
      emoji: "🍞",
      qty: 1,
    },
  ]);

  const updateQty = (id, change) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(0, item.qty + change) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const delivery = 40;
  const total = subtotal + delivery;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart 🛒</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty!</Text>
          <Text style={styles.emptySub}>Add some groceries to get started</Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>{item.unit}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Order Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal}</Text>
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
          </ScrollView>

          {/* Checkout Button */}
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>
              Proceed to Checkout → ₹{total}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  emptySub: { fontSize: 14, color: "#888", marginTop: 8 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemEmoji: { fontSize: 36, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  itemUnit: { fontSize: 11, color: "#888", marginTop: 2 },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#C4622D",
    marginTop: 4,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1A2E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#fff", fontSize: 18, fontWeight: "bold", lineHeight: 22 },
  qtyNum: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2E1A",
    minWidth: 20,
    textAlign: "center",
  },
  summary: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: "#eee",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 12,
  },
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
  checkoutBtn: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#1A2E1A",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
