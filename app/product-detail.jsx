import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductDetail() {
  const router = useRouter();
  const { name, price, unit, emoji, bg } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Product Card */}
      <View style={[styles.productHero, { backgroundColor: bg || "#FFE5E5" }]}>
        <Text style={styles.productEmoji}>{emoji}</Text>
      </View>

      {/* Product Info */}
      <View style={styles.infoBox}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productUnit}>{unit}</Text>
        <Text style={styles.productPrice}>{price}</Text>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.addToCartBtn}>
        <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  backBtn: { padding: 20, paddingTop: 50 },
  backText: { fontSize: 16, color: "#1A2E1A", fontWeight: "600" },
  productHero: {
    marginHorizontal: 20,
    borderRadius: 24,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  productEmoji: { fontSize: 100 },
  infoBox: { padding: 24 },
  productName: { fontSize: 28, fontWeight: "bold", color: "#1A2E1A" },
  productUnit: { fontSize: 14, color: "#888", marginTop: 4 },
  productPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C4622D",
    marginTop: 12,
  },
  addToCartBtn: {
    backgroundColor: "#1A2E1A",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  addToCartText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
