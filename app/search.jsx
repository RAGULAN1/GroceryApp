import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "./CartContext";
import { PRODUCTS_DATA } from "./(tabs)/products";

const THEME = "#1A2E1A";
const ACCENT = "#C4622D";
const CATEGORIES = [
  "All", "Dairy", "Bakery", "Grains", "Dal & Pulses",
  "Oils", "Masala & Spices", "Instant Foods", "Snacks", "Beverages",
];

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart, cartCount } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(PRODUCTS_DATA);
  const [selectedCategory, setCategory] = useState("All");
  const debounceRef = useRef(null);

  const applyFilters = useCallback((q, category) => {
    const lower = q.toLowerCase().trim();
    const filtered = PRODUCTS_DATA.filter((p) => {
      const matchName = !lower || p.name?.toLowerCase().includes(lower);
      const matchCategory = category === "All" || p.category === category;
      return matchName && matchCategory;
    });
    setResults(filtered);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(query, selectedCategory);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCategory, applyFilters]);

  const handleAddToCart = (item) => {
    Alert.alert("Adding", item.name + " added to cart!");
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: "Rs." + item.price,
        unit: item.unit,
        emoji: item.emoji,
        image: item.image,
      },
      1
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchBar}>
        <View style={styles.inputWrap}>
          <Text style={styles.searchIcon}>Search</Text>
          <TextInput
            style={styles.input}
            placeholder="Search groceries..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={{ color: "#aaa", fontSize: 16, padding: 4 }}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => Keyboard.dismiss()}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{results.length} products found</Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: "/product-detail", params: item })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={{ fontSize: 36 }}>{item.emoji || "+"}</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardUnit}>{item.unit || "per kg"}</Text>
                <Text style={styles.cardPrice}>Rs.{item.price}</Text>
              </View>
            </TouchableOpacity>
            <Pressable
              style={styles.addBtn}
              onPress={() => handleAddToCart(item)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FA" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchIcon: { fontSize: 14, marginRight: 8, color: "#888" },
  input: { flex: 1, fontSize: 15, color: "#222" },
  searchBtn: { backgroundColor: THEME, borderRadius: 12, paddingHorizontal: 16, height: 44, justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  categoryRow: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#f0f0f0", borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: THEME },
  chipText: { color: "#555", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  resultCount: { fontSize: 13, color: "#888", paddingHorizontal: 16, paddingVertical: 8 },
  list: { padding: 12, paddingBottom: 40 },
  row: { justifyContent: "space-between" },
  card: { width: "48.5%", backgroundColor: "#fff", borderRadius: 14, marginBottom: 12, elevation: 2 },
  cardImage: { width: "100%", height: 120, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  cardImagePlaceholder: { width: "100%", height: 120, backgroundColor: "#f9f9f9", justifyContent: "center", alignItems: "center" },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#222", marginBottom: 2 },
  cardUnit: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: ACCENT },
  addBtn: { position: "absolute", bottom: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: THEME, justifyContent: "center", alignItems: "center", elevation: 5, zIndex: 999 },
  addBtnText: { color: "#fff", fontSize: 22, fontWeight: "bold", lineHeight: 24 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 12 },
});
