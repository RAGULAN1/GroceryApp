import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "./CartContext";

export default function ProductDetail() {
  const router = useRouter();
  const { id, name, price, unit, emoji, image } = useLocalSearchParams();
  const { addToCart } = useCart();

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
      1
    );
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{emoji || "🛒"}</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.unit}>{unit}</Text>
        <Text style={styles.price}>Rs.{price}</Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
        <Text style={styles.addBtnText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  backBtn: {
    margin: 20,
    alignSelf: "flex-start",
    backgroundColor: "#1A2E1A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backText: { color: "#fff", fontWeight: "600" },
  imageBox: {
    alignItems: "center",
    justifyContent: "center",
    height: 250,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
  },
  productImage: { width: "100%", height: 250, borderRadius: 16 },
  emoji: { fontSize: 80 },
  info: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  name: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A", marginBottom: 8 },
  unit: { fontSize: 14, color: "#888", marginBottom: 8 },
  price: { fontSize: 28, fontWeight: "bold", color: "#C4622D" },
  addBtn: {
    backgroundColor: "#1A2E1A",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
