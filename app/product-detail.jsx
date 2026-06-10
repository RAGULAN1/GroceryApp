import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "./CartContext";

export default function ProductDetailScreen() {
  const { id, name, price, unit, emoji, image, category } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    addToCart(
      {
        id: id || name,
        name: name,
        price: "Rs." + price,
        unit: unit,
        emoji: emoji,
        image: image,
      },
      qty
    );
    Alert.alert(
      "Added to Cart!",
      qty + " x " + name + " added successfully!",
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart") },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <Text style={styles.productEmoji}>{emoji || "🛒"}</Text>
          )}
        </View>

        <View style={styles.infoBox}>
          {category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ) : null}

          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.productUnit}>{unit}</Text>
          <Text style={styles.price}>Rs.{price}</Text>

          <View style={styles.qtyBox}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>Rs.{parseInt(price || 0) * qty}</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
        <Text style={styles.cartBtnText}>Add to Cart - Rs.{parseInt(price || 0) * qty}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#eee" },
  backText: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  imageBox: { height: 300, alignItems: "center", justifyContent: "center", paddingTop: 40, backgroundColor: "#fff" },
  productImage: { width: "100%", height: 300 },
  productEmoji: { fontSize: 120 },
  infoBox: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, padding: 24 },
  categoryBadge: { backgroundColor: "#E5FFE5", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 },
  categoryText: { fontSize: 12, color: "#1A2E1A", fontWeight: "600" },
  productName: { fontSize: 28, fontWeight: "bold", color: "#1A2E1A", marginBottom: 4 },
  productUnit: { fontSize: 14, color: "#888", marginBottom: 8 },
  price: { fontSize: 32, fontWeight: "bold", color: "#C4622D", marginBottom: 20 },
  qtyBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8F9FA", borderRadius: 16, padding: 16, marginBottom: 16 },
  qtyLabel: { fontSize: 16, fontWeight: "600", color: "#1A2E1A" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1A2E1A", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: "#fff", fontSize: 20, fontWeight: "bold", lineHeight: 24 },
  qtyNum: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A", minWidth: 30, textAlign: "center" },
  totalBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  totalLabel: { fontSize: 16, color: "#888" },
  totalPrice: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A" },
  cartBtn: { position: "absolute", bottom: 30, left: 20, right: 20, backgroundColor: "#C4622D", borderRadius: 16, padding: 18, alignItems: "center" },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

