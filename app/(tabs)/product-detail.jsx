import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../CartContext";

export default function ProductDetailScreen() {
  const { id, name, price, unit, emoji, bg, category } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageBox, { backgroundColor: bg || "#FFE5E5" }]}>
          <Text style={styles.productEmoji}>{emoji}</Text>
        </View>
        <View style={styles.infoBox}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.productUnit}>{unit}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Fresh Today</Text>
            </View>
          </View>
          <View style={styles.descBox}>
            <Text style={styles.descTitle}>About this product</Text>
            <Text style={styles.descText}>
              Farm fresh and carefully selected for quality. Delivered directly
              from local farms to your doorstep within 24 hours of harvest. No
              preservatives added.
            </Text>
          </View>
          <View style={styles.detailsBox}>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🌱</Text>
              <Text style={styles.detailLabel}>100% Organic</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>🚚</Text>
              <Text style={styles.detailLabel}>Free Delivery</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>⏰</Text>
              <Text style={styles.detailLabel}>2hr Delivery</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailEmoji}>✅</Text>
              <Text style={styles.detailLabel}>Quality Check</Text>
            </View>
          </View>
          <View style={styles.qtyBox}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(qty + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>
              ₹{parseInt(price?.replace("₹", "") || 0) * qty}
            </Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => {
          addToCart({ id, name, price, unit, emoji, bg, category }, qty);
          alert(`${qty} x ${name} added to cart!`);
        }}
      >
        <Text style={styles.cartBtnText}>
          🛒 Add to Cart — ₹{parseInt(price?.replace("₹", "") || 0) * qty}
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
  imageBox: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  productEmoji: { fontSize: 120 },
  infoBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: 24,
    paddingBottom: 120,
  },
  categoryBadge: {
    backgroundColor: "#E5FFE5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: { fontSize: 12, color: "#1A2E1A", fontWeight: "600" },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 4,
  },
  productUnit: { fontSize: 14, color: "#888", marginBottom: 16 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  price: { fontSize: 32, fontWeight: "bold", color: "#C4622D" },
  badge: {
    backgroundColor: "#1A2E1A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  descBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2E1A",
    marginBottom: 8,
  },
  descText: { fontSize: 14, color: "#666", lineHeight: 22 },
  detailsBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  detailItem: {
    width: "47%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailEmoji: { fontSize: 20 },
  detailLabel: { fontSize: 13, fontWeight: "500", color: "#1A2E1A" },
  qtyBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  qtyLabel: { fontSize: 16, fontWeight: "600", color: "#1A2E1A" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A2E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  qtyNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A2E1A",
    minWidth: 30,
    textAlign: "center",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16, color: "#888" },
  totalPrice: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A" },
  cartBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#C4622D",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
