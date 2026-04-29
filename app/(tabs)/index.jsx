import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const categories = [
  { id: 1, name: "Fruits", emoji: "🍎", color: "#FFE5E5" },
  { id: 2, name: "Vegetables", emoji: "🥦", color: "#E5FFE5" },
  { id: 3, name: "Dairy", emoji: "🥛", color: "#FFF9E5" },
  { id: 4, name: "Bakery", emoji: "🍞", color: "#FFE5CC" },
  { id: 5, name: "Beverages", emoji: "🧃", color: "#E5F0FF" },
  { id: 6, name: "Snacks", emoji: "🍿", color: "#F5E5FF" },
];

const featured = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: "₹40",
    unit: "per kg",
    emoji: "🍅",
    bg: "#FFE5E5",
  },
  {
    id: 2,
    name: "Whole Milk",
    price: "₹60",
    unit: "per litre",
    emoji: "🥛",
    bg: "#FFF9E5",
  },
  {
    id: 3,
    name: "Brown Bread",
    price: "₹45",
    unit: "per pack",
    emoji: "🍞",
    bg: "#FFE5CC",
  },
  {
    id: 4,
    name: "Bananas",
    price: "₹30",
    unit: "per dozen",
    emoji: "🍌",
    bg: "#FFFBE5",
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning! 👋</Text>
          <Text style={styles.subtitle}>What would you like to buy?</Text>
        </View>
        <View style={styles.cartBtn}>
          <Text style={styles.cartEmoji}>🛒</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchText}>🔍 Search for groceries...</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Fresh Groceries</Text>
        <Text style={styles.bannerSub}>Delivered to your door in 2 hours</Text>
        <View style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>Shop Now →</Text>
        </View>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryCard, { backgroundColor: cat.color }]}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Products */}
      <Text style={styles.sectionTitle}>Featured Products</Text>
      <View style={styles.productsGrid}>
        {featured.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.productCard, { backgroundColor: item.bg }]}
          >
            <Text style={styles.productEmoji}>{item.emoji}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productUnit}>{item.unit}</Text>
            <View style={styles.productBottom}>
              <Text style={styles.productPrice}>{item.price}</Text>
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>+</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#1A2E1A" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 2 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cartEmoji: { fontSize: 20 },
  searchBar: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchText: { color: "#aaa", fontSize: 14 },
  banner: {
    marginHorizontal: 20,
    backgroundColor: "#1A2E1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  bannerSub: { fontSize: 13, color: "#aaa", marginTop: 4 },
  bannerBtn: {
    marginTop: 12,
    backgroundColor: "#C4622D",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2E1A",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesRow: { paddingLeft: 20, marginBottom: 24 },
  categoryCard: {
    width: 80,
    height: 90,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 40,
  },
  productCard: { width: "47%", borderRadius: 16, padding: 14 },
  productEmoji: { fontSize: 36, marginBottom: 8 },
  productName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  productUnit: { fontSize: 11, color: "#888", marginTop: 2 },
  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1A2E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
  },
});
