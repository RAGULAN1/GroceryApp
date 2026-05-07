import { useRouter } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Keyboard,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

const THEME = "#1A2E1A";
const ACCENT = "#C4622D";

const CATEGORIES = ["All","Dairy","Bakery","Grains","Dal & Pulses","Vegetables","Fruits","Snacks","Beverages","Spices","Oil & Ghee"];
const PRICE_RANGES = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50–₹100", min: 50, max: 100 },
  { label: "₹100–₹200", min: 100, max: 200 },
  { label: "Above ₹200", min: 200, max: Infinity },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setCategory] = useState("All");
  const [selectedPrice, setPrice] = useState(PRICE_RANGES[0]);
  const debounceRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllProducts(data);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyFilters = useCallback((q, category, priceRange) => {
    const lower = q.toLowerCase().trim();
    const filtered = allProducts.filter(p => {
      const matchName = !lower || p.name?.toLowerCase().includes(lower);
      const matchCategory = category === "All" || p.category === category;
      const price = parseFloat(p.price) || 0;
      const matchPrice = price >= priceRange.min && price <= priceRange.max;
      return matchName && matchCategory && matchPrice;
    });
    setResults(filtered);
  }, [allProducts]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(query, selectedCategory, selectedPrice);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCategory, selectedPrice, allProducts]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchBar}>
        <View style={styles.inputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search groceries..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("") }>
              <Text style={{ color: "#aaa", fontSize: 16, padding: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => Keyboard.dismiss()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardUnit}>{item.unit || "per kg"}</Text>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FA" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#222" },
  searchBtn: { backgroundColor: THEME, borderRadius: 12, paddingHorizontal: 16, height: 44, justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  categoryRow: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#f0f0f0", borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: THEME },
  chipText: { color: "#555", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  list: { padding: 12, paddingBottom: 40 },
  row: { justifyContent: "space-between" },
  card: { width: "48.5%", backgroundColor: "#fff", borderRadius: 14, padding: 12, marginBottom: 12, elevation: 2 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#222", marginBottom: 4 },
  cardUnit: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: ACCENT },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 12 },
});
