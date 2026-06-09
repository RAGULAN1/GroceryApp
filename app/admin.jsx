import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PRODUCTS_DATA } from "./(tabs)/products";

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default function AdminScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [stockFilter, setStockFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", unit: "", category: "", emoji: "", stock: "100" });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      setOrders(data.documents || []);
    } catch (err) {
      console.log("Error fetching orders:", err);
    }
  };

  const fetchAdminProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/adminProducts?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      setAdminProducts(data.documents || []);
    } catch (err) {
      console.log("No admin products yet");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:query?key=${FIREBASE_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
      );
      const data = await res.json();
      setCustomers(data.userInfo || []);
    } catch (err) {
      console.log("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchOrders();
      await fetchAdminProducts();
      await fetchCustomers();
      setLoading(false);
    };
    loadAll();
  }, []);

  const updateOrderStatus = async (orderPath, newStatus) => {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/${orderPath}?updateMask.fieldPaths=status&key=${FIREBASE_API_KEY}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { status: { stringValue: newStatus } } }),
        }
      );
      if (res.ok) {
        Alert.alert("Updated!", `Order status: ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update order!");
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Error", "Name and price required!");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/adminProducts?key=${FIREBASE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            name: { stringValue: newProduct.name },
            price: { stringValue: newProduct.price },
            unit: { stringValue: newProduct.unit },
            category: { stringValue: newProduct.category },
            emoji: { stringValue: newProduct.emoji || "🛒" },
            stock: { integerValue: parseInt(newProduct.stock) || 100 },
          }
        }),
      });
      if (res.ok) {
        Alert.alert("Success!", "Product added!");
        setShowAddProduct(false);
        setNewProduct({ name: "", price: "", unit: "", category: "", emoji: "", stock: "100" });
        fetchAdminProducts();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to add product!");
    }
  };

  const deleteProduct = (productPath) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`https://firestore.googleapis.com/v1/${productPath}?key=${FIREBASE_API_KEY}`, { method: "DELETE" });
            Alert.alert("Deleted!", "Product removed!");
            fetchAdminProducts();
          } catch (err) {
            Alert.alert("Error", "Failed to delete!");
          }
        },
      },
    ]);
  };

  const getTotalRevenue = () => orders.reduce((sum, o) => sum + (parseInt(o.fields?.total?.integerValue) || 0), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed": return "#FFF3CD";
      case "Processing": return "#CCE5FF";
      case "Out for Delivery": return "#D4EDDA";
      case "Delivered": return "#D4EDDA";
      case "Cancelled": return "#F8D7DA";
      default: return "#FFF3CD";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Placed": return "#856404";
      case "Processing": return "#004085";
      case "Out for Delivery": return "#155724";
      case "Delivered": return "#155724";
      case "Cancelled": return "#721C24";
      default: return "#856404";
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return "#F8D7DA";
    if (stock <= 10) return "#FFF3CD";
    return "#D4EDDA";
  };

  const getStockTextColor = (stock) => {
    if (stock <= 0) return "#721C24";
    if (stock <= 10) return "#856404";
    return "#155724";
  };

  const getStockLabel = (stock) => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  // Combine built-in products with admin products for stock view
  const allProducts = [
    ...PRODUCTS_DATA.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: p.category,
      emoji: p.emoji,
      stock: 100, // default stock
      isBuiltIn: true,
    })),
    ...adminProducts.map(p => ({
      id: p.name?.split("/").pop(),
      name: p.fields?.name?.stringValue,
      price: p.fields?.price?.stringValue,
      unit: p.fields?.unit?.stringValue,
      category: p.fields?.category?.stringValue,
      emoji: p.fields?.emoji?.stringValue,
      stock: parseInt(p.fields?.stock?.integerValue) || 100,
      isBuiltIn: false,
      path: p.name,
    })),
  ];

  const filteredProducts = allProducts.filter(p => {
    if (stockFilter === "low") return p.stock <= 10 && p.stock > 0;
    if (stockFilter === "out") return p.stock <= 0;
    return true;
  });

  const categoryCounts = {};
  allProducts.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#E5FFE5" }]}>
          <Text style={styles.statEmoji}>📦</Text>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFF3CD" }]}>
          <Text style={styles.statEmoji}>🆕</Text>
          <Text style={styles.statNumber}>{orders.filter(o => o.fields?.status?.stringValue === "Placed").length}</Text>
          <Text style={styles.statLabel}>New Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#CCE5FF" }]}>
          <Text style={styles.statEmoji}>🚚</Text>
          <Text style={styles.statNumber}>{orders.filter(o => o.fields?.status?.stringValue === "Out for Delivery").length}</Text>
          <Text style={styles.statLabel}>On Delivery</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#D4EDDA" }]}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statNumber}>{orders.filter(o => o.fields?.status?.stringValue === "Delivered").length}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#F8D7DA" }]}>
          <Text style={styles.statEmoji}>❌</Text>
          <Text style={styles.statNumber}>{orders.filter(o => o.fields?.status?.stringValue === "Cancelled").length}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E5FFE5" }]}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statNumber}>Rs.{getTotalRevenue()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {orders.slice(0, 3).map((order, index) => {
        const fields = order.fields || {};
        const status = fields.status?.stringValue || "Placed";
        return (
          <View key={index} style={styles.recentCard}>
            <View style={styles.orderTop}>
              <Text style={styles.customerName}>{fields.name?.stringValue || "Customer"}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                <Text style={[styles.statusText, { color: getStatusTextColor(status) }]}>{status}</Text>
              </View>
            </View>
            <Text style={styles.orderTotal}>Rs.{fields.total?.integerValue || 0} | {fields.selectedSlot?.stringValue || ""}</Text>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
        <Text style={styles.refreshBtnText}>🔄 Refresh Orders</Text>
      </TouchableOpacity>
      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>No orders yet!</Text>
        </View>
      ) : (
        orders.map((order, index) => {
          const fields = order.fields || {};
          const status = fields.status?.stringValue || "Placed";
          const orderName = order.name || "";
          const orderId = orderName.split("/").pop();
          return (
            <View key={index} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>Order #{orderId.slice(-6)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                  <Text style={[styles.statusText, { color: getStatusTextColor(status) }]}>{status}</Text>
                </View>
              </View>
              <Text style={styles.customerName}>{fields.name?.stringValue}</Text>
              <Text style={styles.customerPhone}>{fields.phone?.stringValue}</Text>
              <Text style={styles.customerAddress}>{fields.address?.stringValue}</Text>
              <Text style={styles.deliverySlot}>Slot: {fields.selectedSlot?.stringValue}</Text>
              <Text style={styles.orderTotal}>Total: Rs.{fields.total?.integerValue}</Text>
              <View style={styles.actionRow}>
                {["Processing", "Out for Delivery", "Delivered", "Cancelled"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.actionBtn, status === s && styles.actionBtnActive]}
                    onPress={() => updateOrderStatus(orderName, s)}
                  >
                    <Text style={[styles.actionBtnText, status === s && styles.actionBtnTextActive]}>
                      {s === "Out for Delivery" ? "Delivery" : s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* Summary Cards */}
      <View style={styles.stockSummary}>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#D4EDDA" }]}>
          <Text style={styles.stockSummaryNum}>{allProducts.length}</Text>
          <Text style={styles.stockSummaryLabel}>Total Products</Text>
        </View>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#FFF3CD" }]}>
          <Text style={styles.stockSummaryNum}>{Object.keys(categoryCounts).length}</Text>
          <Text style={styles.stockSummaryLabel}>Categories</Text>
        </View>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#CCE5FF" }]}>
          <Text style={styles.stockSummaryNum}>{adminProducts.length}</Text>
          <Text style={styles.stockSummaryLabel}>Custom Added</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <Text style={styles.sectionTitle}>Products by Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <View key={cat} style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{cat}</Text>
            <Text style={styles.categoryChipCount}>{count}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Stock Filter */}
      <Text style={styles.sectionTitle}>Product Stock List</Text>
      <View style={styles.filterRow}>
        {["all", "low", "out"].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, stockFilter === f && styles.filterBtnActive]}
            onPress={() => setStockFilter(f)}
          >
            <Text style={[styles.filterBtnText, stockFilter === f && styles.filterBtnTextActive]}>
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Product Button */}
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddProduct(true)}>
        <Text style={styles.addBtnText}>+ Add New Product</Text>
      </TouchableOpacity>

      {/* Product List */}
      {filteredProducts.map((product, index) => (
        <View key={index} style={styles.productCard}>
          <View style={styles.productRow}>
            <Text style={styles.productEmoji}>{product.emoji || "🛒"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>Rs.{product.price} | {product.unit}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <View style={[styles.stockBadge, { backgroundColor: getStockColor(product.stock) }]}>
                <Text style={[styles.stockBadgeText, { color: getStockTextColor(product.stock) }]}>
                  {getStockLabel(product.stock)}
                </Text>
              </View>
              <Text style={styles.stockCount}>Stock: {product.stock}</Text>
              {!product.isBuiltIn && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(product.path)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderCustomers = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.statCard, { backgroundColor: "#E5FFE5", marginBottom: 16, width: "100%" }]}>
        <Text style={styles.statEmoji}>👥</Text>
        <Text style={styles.statNumber}>{customers.length}</Text>
        <Text style={styles.statLabel}>Total Customers</Text>
      </View>
      {customers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyText}>No customers yet!</Text>
        </View>
      ) : (
        customers.map((customer, index) => (
          <View key={index} style={styles.customerCard}>
            <Text style={styles.customerCardIcon}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerCardName}>{customer.displayName || "User"}</Text>
              <Text style={styles.customerCardEmail}>{customer.email}</Text>
              <Text style={styles.customerCardOrders}>
                Orders: {orders.filter(o => o.fields?.userId?.stringValue === customer.localId).length}
              </Text>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.exitBtn}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {["dashboard", "orders", "products", "customers"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabEmoji}>
              {tab === "dashboard" ? "📊" : tab === "orders" ? "📦" : tab === "products" ? "🛍️" : "👥"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1A2E1A" style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "customers" && renderCustomers()}
        </View>
      )}

      <Modal visible={showAddProduct} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <ScrollView>
              {[
                { key: "name", placeholder: "Product Name *" },
                { key: "price", placeholder: "Price (e.g. 60) *" },
                { key: "unit", placeholder: "Unit (e.g. per kg)" },
                { key: "category", placeholder: "Category (e.g. Dairy)" },
                { key: "emoji", placeholder: "Emoji (e.g. 🥛)" },
                { key: "stock", placeholder: "Stock Count (e.g. 100)" },
              ].map((field) => (
                <TextInput
                  key={field.key}
                  style={styles.modalInput}
                  placeholder={field.placeholder}
                  value={newProduct[field.key]}
                  onChangeText={(text) => setNewProduct({ ...newProduct, [field.key]: text })}
                  placeholderTextColor="#aaa"
                  keyboardType={field.key === "stock" || field.key === "price" ? "numeric" : "default"}
                />
              ))}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#eee" }]} onPress={() => setShowAddProduct(false)}>
                <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#1A2E1A" }]} onPress={addProduct}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A" },
  exitBtn: { color: "#C4622D", fontWeight: "600", fontSize: 14 },
  tabRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 16, backgroundColor: "#fff", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: "#eee" },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#1A2E1A" },
  tabEmoji: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A", marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { width: "47%", borderRadius: 16, padding: 16, alignItems: "center" },
  statEmoji: { fontSize: 28, marginBottom: 4 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  statLabel: { fontSize: 11, color: "#555", marginTop: 2 },
  recentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  refreshBtn: { backgroundColor: "#E5FFE5", borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 12 },
  refreshBtnText: { color: "#1A2E1A", fontWeight: "600" },
  orderCard: { backgroundColor: "#fff", marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  orderTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: "bold", color: "#1A2E1A" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  customerName: { fontSize: 15, fontWeight: "600", color: "#1A2E1A" },
  customerPhone: { fontSize: 13, color: "#888", marginTop: 2 },
  customerAddress: { fontSize: 12, color: "#888", marginTop: 2 },
  deliverySlot: { fontSize: 12, color: "#555", marginTop: 4 },
  orderTotal: { fontSize: 14, fontWeight: "bold", color: "#C4622D", marginTop: 4 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#1A2E1A" },
  actionBtnActive: { backgroundColor: "#1A2E1A" },
  actionBtnText: { fontSize: 11, color: "#1A2E1A", fontWeight: "500" },
  actionBtnTextActive: { color: "#fff" },
  stockSummary: { flexDirection: "row", gap: 8, marginBottom: 16 },
  stockSummaryCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  stockSummaryNum: { fontSize: 22, fontWeight: "bold", color: "#1A2E1A" },
  stockSummaryLabel: { fontSize: 10, color: "#555", marginTop: 2, textAlign: "center" },
  categoryChip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
  categoryChipText: { fontSize: 12, color: "#1A2E1A", fontWeight: "600" },
  categoryChipCount: { fontSize: 16, fontWeight: "bold", color: "#C4622D", marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  filterBtnActive: { backgroundColor: "#1A2E1A", borderColor: "#1A2E1A" },
  filterBtnText: { fontSize: 11, color: "#888", fontWeight: "600" },
  filterBtnTextActive: { color: "#fff" },
  addBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 12 },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  productCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  productEmoji: { fontSize: 28 },
  productName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  productPrice: { fontSize: 12, color: "#C4622D", marginTop: 2 },
  productCategory: { fontSize: 11, color: "#888", marginTop: 2 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stockBadgeText: { fontSize: 10, fontWeight: "600" },
  stockCount: { fontSize: 12, color: "#888", fontWeight: "500" },
  deleteBtn: { backgroundColor: "#F8D7DA", borderRadius: 6, padding: 6 },
  deleteBtnText: { color: "#721C24", fontWeight: "600", fontSize: 11 },
  customerCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center", gap: 12 },
  customerCardIcon: { fontSize: 32 },
  customerCardName: { fontSize: 15, fontWeight: "600", color: "#1A2E1A" },
  customerCardEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  customerCardOrders: { fontSize: 12, color: "#C4622D", marginTop: 2, fontWeight: "600" },
  emptyBox: { alignItems: "center", marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  emptySub: { fontSize: 13, color: "#888", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A", marginBottom: 16 },
  modalInput: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: "#eee", color: "#1A2E1A" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
});
