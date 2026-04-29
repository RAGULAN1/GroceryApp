import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

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
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching from db:", db);
      const querySnapshot = await getDocs(collection(db, "products"));
      console.log("Query snapshot size:", querySnapshot.size);
      const items = [];
      querySnapshot.forEach((doc) => {
        console.log("Doc:", doc.id, doc.data());
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
    } catch (error) {
      console.log("Error fetching products:", error.message);
    }
    setLoading(false);
  };

  const filtered =
    selected === "All"
      ? products
      : products.filter((p) => p.category === selected);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#1A2E1A" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

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
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 14, color: "#888", marginTop: 12 },
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
