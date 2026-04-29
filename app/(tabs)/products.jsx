import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const products = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: "₹40",
    unit: "per kg",
    emoji: "🍅",
    bg: "#FFE5E5",
    category: "Vegetables",
  },
  {
    id: 2,
    name: "Whole Milk",
    price: "₹60",
    unit: "per litre",
    emoji: "🥛",
    bg: "#FFF9E5",
    category: "Dairy",
  },
  {
    id: 3,
    name: "Brown Bread",
    price: "₹45",
    unit: "per pack",
    emoji: "🍞",
    bg: "#FFE5CC",
    category: "Bakery",
  },
  {
    id: 4,
    name: "Bananas",
    price: "₹30",
    unit: "per dozen",
    emoji: "🍌",
    bg: "#FFFBE5",
    category: "Fruits",
  },
  {
    id: 5,
    name: "Spinach",
    price: "₹25",
    unit: "per bunch",
    emoji: "🥬",
    bg: "#E5FFE5",
    category: "Vegetables",
  },
  {
    id: 6,
    name: "Eggs",
    price: "₹80",
    unit: "per dozen",
    emoji: "🥚",
    bg: "#FFF5E5",
    category: "Dairy",
  },
  {
    id: 7,
    name: "Apples",
    price: "₹120",
    unit: "per kg",
    emoji: "🍎",
    bg: "#FFE5E5",
    category: "Fruits",
  },
  {
    id: 8,
    name: "Orange Juice",
    price: "₹90",
    unit: "per litre",
    emoji: "🍊",
    bg: "#FFE5CC",
    category: "Beverages",
  },
  {
    id: 9,
    name: "Potato Chips",
    price: "₹35",
    unit: "per pack",
    emoji: "🍿",
    bg: "#F5E5FF",
    category: "Snacks",
  },
  {
    id: 10,
    name: "Carrots",
    price: "₹30",
    unit: "per kg",
    emoji: "🥕",
    bg: "#FFE5CC",
    category: "Vegetables",
  },
];

const categories = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
];

export default function ProductsScreen() {
  const [selected, setSelected] = React.useState("All");
  const filtered =
    selected === "All"
      ? products
      : products.filter((p) => p.category === selected);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Products</Text>

      {/* Category Filter */}
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

      {/* Products Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: item.bg }]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.unit}>{item.unit}</Text>
              <View style={styles.bottom}>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.addBtn}>
                  <Text style={styles.addText}>+</Text>
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
  card: { width: "47%", borderRadius: 16, padding: 14 },
  emoji: { fontSize: 36, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  unit: { fontSize: 11, color: "#888", marginTop: 2 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
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
