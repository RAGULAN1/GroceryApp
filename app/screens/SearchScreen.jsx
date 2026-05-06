import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseConfig";

const THEME = "#1a472a";
const ACCENT = "#c0392b";

const CATEGORIES = [
  "All",
  "Dairy",
  "Bakery",
  "Grains",
  "Dal & Pulses",
  "Vegetables",
  "Fruits",
  "Snacks",
  "Beverages",
  "Spices",
  "Oil & Ghee",
];

const PRICE_RANGES = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹50", min: 0, max: 50 },
  { label: "₹50–₹100", min: 50, max: 100 },
  { label: "₹100–₹200", min: 100, max: 200 },
  { label: "Above ₹200", min: 200, max: Infinity },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setCategory] = useState("All");
  const [selectedPrice, setPrice] = useState(PRICE_RANGES[0]);
  const [brandFilter, setBrandFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allBrands, setAllBrands] = useState([]);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllProducts(data);
        setResults(data);
        const brands = [...new Set(data.map((p) => p.brand).filter(Boolean))];
        setAllBrands(brands);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyFilters = useCallback(
    (q, category, priceRange, brand) => {
      const lower = q.toLowerCase().trim();
      const filtered = allProducts.filter((p) => {
        const matchName = !lower || p.name?.toLowerCase().includes(lower);
        const matchCategory = category === "All" || p.category === category;
        const matchBrand =
          !brand || p.brand?.toLowerCase().includes(brand.toLowerCase());
        const price = parseFloat(p.price) || 0;
        const matchPrice = price >= priceRange.min && price <= priceRange.max;
        return matchName && matchCategory && matchBrand && matchPrice;
      });
      setResults(filtered);
      setSearching(false);
    },
    [allProducts],
  );

  useEffect(() => {
    if (!allProducts.length) return;
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(query, selectedCategory, selectedPrice, brandFilter);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [
    query,
    selectedCategory,
    selectedPrice,
    brandFilter,
    allProducts,
    applyFilters,
  ]);

  const handleSearchPress = () => {
    Keyboard.dismiss();
    setSearching(true);
    applyFilters(query, selectedCategory, selectedPrice, brandFilter);
  };

  const clearAll = () => {
    setQuery("");
    setCategory("All");
    setPrice(PRICE_RANGES[0]);
    setBrandFilter("");
    inputRef.current?.focus();
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedPrice.label !== "All" ||
    brandFilter !== "";

  const ProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation?.navigate("product-detail", { product: item })}
    >
      <View style={styles.cardImageWrap}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={{ fontSize: 36 }}>🛒</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.brand ? <Text style={styles.cardBrand}>{item.brand}</Text> : null}
        <Text style={styles.cardUnit}>{item.unit || "per kg"}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>₹{item.price}</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.empty}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyText}>
        Try different name, category or price range
      </Text>
      <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
        <Text style={styles.clearBtnText}>Clear all filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchBar}>
        <View style={styles.inputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search groceries..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearchPress}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={{ padding: 4 }}
            >
              <Text style={{ color: "#aaa", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchPress}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterToggleRow}>
        <TouchableOpacity
          style={[
            styles.filterToggleBtn,
            hasActiveFilters && styles.filterToggleBtnActive,
          ]}
          onPress={() => setShowFilters((v) => !v)}
        >
          <Text
            style={[
              styles.filterToggleText,
              hasActiveFilters && { color: THEME },
            ]}
          >
            ⚙️ Filters {hasActiveFilters ? "●" : ""}
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultCount}>
          {searching
            ? "..."
            : `${results.length} result${results.length !== 1 ? "s" : ""}`}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={{ color: ACCENT, fontSize: 13, fontWeight: "600" }}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      selectedCategory === cat && styles.chipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.filterLabel}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {PRICE_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.chip,
                      selectedPrice.label === range.label && styles.chipActive,
                    ]}
                    onPress={() => setPrice(range)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPrice.label === range.label &&
                          styles.chipTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {allBrands.length > 0 && (
              <>
                <Text style={styles.filterLabel}>Brand</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        brandFilter === "" && styles.chipActive,
                      ]}
                      onPress={() => setBrandFilter("")}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          brandFilter === "" && styles.chipTextActive,
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {allBrands.map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.chip,
                          brandFilter === brand && styles.chipActive,
                        ]}
                        onPress={() => setBrandFilter(brand)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            brandFilter === brand && styles.chipTextActive,
                          ]}
                        >
                          {brand}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <Text style={styles.filterLabel}>Or type brand name</Text>
            <TextInput
              style={styles.brandInput}
              placeholder="e.g. Amul, Aashirvaad..."
              placeholderTextColor="#aaa"
              value={brandFilter}
              onChangeText={setBrandFilter}
            />
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={THEME} />
          <Text style={{ color: "#888", marginTop: 12 }}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard item={item} />}
          ListEmptyComponent={<EmptyState />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            searching ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 8,
                  gap: 8,
                }}
              >
                <ActivityIndicator size="small" color={THEME} />
                <Text style={{ color: "#888", fontSize: 13 }}>
                  Searching...
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f6f4" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#222" },
  searchBtn: {
    backgroundColor: THEME,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  filterToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterToggleBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterToggleBtnActive: { borderColor: THEME, backgroundColor: "#e8f5e9" },
  filterToggleText: { fontSize: 13, color: "#555", fontWeight: "600" },
  resultCount: { flex: 1, fontSize: 13, color: "#888", textAlign: "right" },

  filterPanel: {
    backgroundColor: "#fff",
    maxHeight: 240,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: THEME },
  chipText: { color: "#555", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  brandInput: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#222",
    borderWidth: 1,
    borderColor: "#ececec",
    marginBottom: 8,
  },

  list: { padding: 12, paddingBottom: 40 },
  row: { justifyContent: "space-between" },

  card: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardImageWrap: { width: "100%", height: 120, backgroundColor: "#f9f9f9" },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#222", marginBottom: 2 },
  cardBrand: { fontSize: 11, color: "#999", marginBottom: 2 },
  cardUnit: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: ACCENT },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 20, lineHeight: 22 },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 20,
    backgroundColor: THEME,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  clearBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
