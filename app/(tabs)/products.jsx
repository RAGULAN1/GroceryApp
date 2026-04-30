import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const products = [
  {
    id: "1",
    name: "Basmati Rice",
    price: "120",
    unit: "per kg",
    category: "Grains",
    image: "https://images.unsplash.com/photo-1536304993881-ff86e0c9b5c3?w=400",
  },
  {
    id: "2",
    name: "Toor Dal",
    price: "90",
    unit: "per kg",
    category: "Pulses",
    image: "https://images.unsplash.com/photo-1585996165357-98ea93d97e14?w=400",
  },
  {
    id: "3",
    name: "Fresh Tomatoes",
    price: "40",
    unit: "per kg",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1546470427-1ec4e1ba3bac?w=400",
  },
  {
    id: "4",
    name: "Onions",
    price: "30",
    unit: "per kg",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
  },
  {
    id: "5",
    name: "Coconut Oil",
    price: "180",
    unit: "per litre",
    category: "Oils",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
  },
  {
    id: "6",
    name: "Fresh Coriander",
    price: "15",
    unit: "per bunch",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
  },
  {
    id: "7",
    name: "Whole Milk",
    price: "60",
    unit: "per litre",
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
  },
  {
    id: "8",
    name: "Turmeric Powder",
    price: "45",
    unit: "per 100g",
    category: "Spices",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
  },
  {
    id: "9",
    name: "Bananas",
    price: "30",
    unit: "per dozen",
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
  },
  {
    id: "10",
    name: "Idli Rice",
    price: "80",
    unit: "per kg",
    category: "Grains",
    image: "https://images.unsplash.com/photo-1536304993881-ff86e0c9b5c3?w=400",
  },
  {
    id: "11",
    name: "Chana Dal",
    price: "85",
    unit: "per kg",
    category: "Pulses",
    image: "https://images.unsplash.com/photo-1585996165357-98ea93d97e14?w=400",
  },
  {
    id: "12",
    name: "Fresh Spinach",
    price: "20",
    unit: "per bunch",
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
  },
];

const categories = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Grains",
  "Pulses",
  "Oils",
  "Spices",
];

export default function ProductsScreen() {
  const [selected, setSelected] = useState("All");
  const router = useRouter();

  const filtered =
    selected === "All"
      ? products
      : products.filter((p) => p.category === selected);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Products</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterBtn,
              selected === cat && styles.filterBtnActive,
            ]}
            onPress={() => setSelected(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selected === cat && styles.filterTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/product-detail",
                  params: item,
                })
              }
            >
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.cardInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.unit}>{item.unit}</Text>
                <View style={styles.bottom}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <View style={styles.addBtn}>
                    <Text style={styles.addText}>+</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  filterRow: { paddingLeft: 20, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterBtnActive: { backgroundColor: "#1A2E1A", borderColor: "#1A2E1A" },
  filterText: { fontSize: 13, color: "#888", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    width: "47%",
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  productImage: { width: "100%", height: 140 },
  cardInfo: { padding: 12 },
  name: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  unit: { fontSize: 11, color: "#888", marginTop: 2 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A2E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 18, fontWeight: "bold", lineHeight: 22 },
});
