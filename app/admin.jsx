import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", unit: "", category: "", emoji: "", stock: "" });
  const [stockFilter, setStockFilter] = useState("all");
  const [adminInfo, setAdminInfo] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const selectedStatusRef = useRef(null);
  const selectedCategoryRef = useRef(null);
  const activeTabRef = useRef("dashboard");
  
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", unit: "", category: "", emoji: "", stock: "100"
  });

  useEffect(() => {
    loadAdminInfo();
    loadAll();

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedStatusRef.current !== null) {
        setSelectedStatus(null);
        selectedStatusRef.current = null;
        return true;
      }
      if (selectedCategoryRef.current !== null) {
        setSelectedCategory(null);
        selectedCategoryRef.current = null;
        return true;
      }
      if (activeTabRef.current !== "dashboard") {
        setActiveTab("dashboard");
        activeTabRef.current = "dashboard";
        return true;
      }
      return false;
    });

    const interval = setInterval(() => {
      fetchOrders();
      setLastUpdated(new Date());
    }, 30000);

    return () => {
      backHandler.remove();
      clearInterval(interval);
    };
  }, []);

  const loadAdminInfo = async () => {
    try {
      const saved = await AsyncStorage.getItem("kadai_admin");
      if (saved) setAdminInfo(JSON.parse(saved));
    } catch (e) {}
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchAdminProducts(), fetchCustomers()]);
    setLoading(false);
  };



  // Sync refs with state
  useEffect(() => { selectedStatusRef.current = selectedStatus; }, [selectedStatus]);
  useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      const docs = data.documents || [];
      docs.sort((a, b) => {
        const timeA = a.fields?.createdAt?.stringValue
          ? new Date(a.fields.createdAt.stringValue).getTime()
          : new Date(a.createTime || 0).getTime();
        const timeB = b.fields?.createdAt?.stringValue
          ? new Date(b.fields.createdAt.stringValue).getTime()
          : new Date(b.createTime || 0).getTime();
        return timeB - timeA;
      });
      setOrders(docs);
      setLastUpdated(new Date());
    } catch (err) {}
  };

  const fetchAdminProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/adminProducts?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      setAdminProducts(data.documents || []);
    } catch (err) {}
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users?key=${FIREBASE_API_KEY}`);
      const data = await res.json();
      setCustomers(data.documents || []);
    } catch (err) {}
  };

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
      if (res.ok) { Alert.alert("Updated!", `Status: ${newStatus}`); fetchOrders(); }
    } catch (err) { Alert.alert("Error", "Failed!"); }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) { Alert.alert("Error", "Name and price required!"); return; }
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
    } catch (err) { Alert.alert("Error", "Failed!"); }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: String(product.price || ""),
      unit: product.unit || "",
      category: product.category || "",
      emoji: product.emoji || "",
      stock: String(product.stock || "100"),
    });
    setShowEditProduct(true);
  };

  const saveEditProduct = async () => {
    if (!editForm.name || !editForm.price) { Alert.alert("Error", "Name and price required!"); return; }
    try {
      const APIKEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
      const BASEURL = "https://firestore.googleapis.com/v1/projects/kadai-veedhi/databases/(default)/documents";
      if (editingProduct.isBuiltIn) {
        const res = await fetch(BASEURL + "/adminProducts?key=" + APIKEY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: {
            name: { stringValue: editForm.name },
            price: { stringValue: editForm.price },
            unit: { stringValue: editForm.unit },
            category: { stringValue: editForm.category },
            emoji: { stringValue: editForm.emoji || "🛒" },
            stock: { integerValue: parseInt(editForm.stock) || 100 },
          }}),
        });
        if (res.ok) { Alert.alert("Saved!", "Product saved!"); setShowEditProduct(false); fetchAdminProducts(); }
        else { Alert.alert("Error", "Failed!"); }
      } else {
        const parts = editingProduct.path.split("/documents/");
        const docPath = parts.length > 1 ? parts[1] : editingProduct.path;
        const url = BASEURL + "/" + docPath + "?updateMask.fieldPaths=name&updateMask.fieldPaths=price&updateMask.fieldPaths=unit&updateMask.fieldPaths=category&updateMask.fieldPaths=emoji&updateMask.fieldPaths=stock&key=" + APIKEY;
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: {
            name: { stringValue: editForm.name },
            price: { stringValue: editForm.price },
            unit: { stringValue: editForm.unit },
            category: { stringValue: editForm.category },
            emoji: { stringValue: editForm.emoji || "🛒" },
            stock: { integerValue: parseInt(editForm.stock) || 100 },
          }}),
        });
        if (res.ok) { Alert.alert("Updated!", "Product updated!"); setShowEditProduct(false); fetchAdminProducts(); }
        else { Alert.alert("Error", "Failed to update!"); }
      }
    } catch (err) { Alert.alert("Error", err.message); }
  };

  const deleteProduct = (productPath) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await fetch(`https://firestore.googleapis.com/v1/${productPath}?key=${FIREBASE_API_KEY}`, { method: "DELETE" });
        fetchAdminProducts();
      }},
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await AsyncStorage.removeItem("kadai_admin");
        router.replace("/(tabs)");
      }},
    ]);
  };

  const getTotalRevenue = () => orders.reduce((sum, o) => sum + (parseInt(o.fields?.total?.integerValue) || 0), 0);

  const getStatusColor = (s) => ({ Placed: "#FFF3CD", Processing: "#CCE5FF", "Out for Delivery": "#D4EDDA", Delivered: "#D4EDDA", Cancelled: "#F8D7DA" }[s] || "#FFF3CD");
  const getStatusTextColor = (s) => ({ Placed: "#856404", Processing: "#004085", "Out for Delivery": "#155724", Delivered: "#155724", Cancelled: "#721C24" }[s] || "#856404");
  const getStockColor = (stock) => stock <= 0 ? "#F8D7DA" : stock <= 10 ? "#FFF3CD" : "#D4EDDA";
  const getStockTextColor = (stock) => stock <= 0 ? "#721C24" : stock <= 10 ? "#856404" : "#155724";
  const getStockLabel = (stock) => stock <= 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "In Stock";

  const allProducts = [
    ...PRODUCTS_DATA.map(p => ({ ...p, stock: 100, isBuiltIn: true })),
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

  const categoryCounts = {};
  allProducts.forEach(p => { if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1; });

  const filteredProducts = allProducts.filter(p => {
    if (stockFilter === "low") return p.stock <= 10 && p.stock > 0;
    if (stockFilter === "out") return p.stock <= 0;
    return true;
  });

  const tabs = [
    { key: "dashboard", emoji: "📊", label: "Dashboard" },
    { key: "orders", emoji: "📦", label: "Orders" },
    { key: "products", emoji: "🛍️", label: "Products" },
    { key: "customers", emoji: "👥", label: "Users" },
    { key: "account", emoji: "👑", label: "Admin" },
  ];

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>📊 Overview</Text>
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
        <View style={[styles.statCard, { backgroundColor: "#E8D5FF" }]}>
          <Text style={styles.statEmoji}>👥</Text>
          <Text style={styles.statNumber}>{customers.length}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFE5CC" }]}>
          <Text style={styles.statEmoji}>🛍️</Text>
          <Text style={styles.statNumber}>{allProducts.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E5FFE5" }]}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statNumber}>Rs.{getTotalRevenue()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🕐 Recent Orders</Text>
      {orders.slice(0, 5).map((order, index) => {
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


  const renderOrders = () => {
    const categorized = {
      Placed: orders.filter(o => o.fields?.status?.stringValue === "Placed"),
      Processing: orders.filter(o => o.fields?.status?.stringValue === "Processing"),
      "Out for Delivery": orders.filter(o => o.fields?.status?.stringValue === "Out for Delivery"),
      Delivered: orders.filter(o => o.fields?.status?.stringValue === "Delivered"),
      Cancelled: orders.filter(o => o.fields?.status?.stringValue === "Cancelled"),
    };

    const sections = [
      { key: "Placed", label: "New Orders", emoji: "🆕", color: "#FFF3CD", textColor: "#856404" },
      { key: "Processing", label: "Processing", emoji: "⚙️", color: "#CCE5FF", textColor: "#004085" },
      { key: "Out for Delivery", label: "Out for Delivery", emoji: "🚚", color: "#D4EDDA", textColor: "#155724" },
      { key: "Delivered", label: "Delivered", emoji: "✅", color: "#D4EDDA", textColor: "#155724" },
      { key: "Cancelled", label: "Cancelled", emoji: "❌", color: "#F8D7DA", textColor: "#721C24" },
    ];

    if (selectedStatus) {
      const section = sections.find(s => s.key === selectedStatus);
      const filteredOrders = categorized[selectedStatus];
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedStatus(null)}>
            <Text style={styles.backBtnText}>← Back to Overview</Text>
          </TouchableOpacity>

          <View style={[styles.selectedHeader, { backgroundColor: section.color }]}>
            <Text style={styles.selectedHeaderEmoji}>{section.emoji}</Text>
            <Text style={[styles.selectedHeaderTitle, { color: section.textColor }]}>{section.label}</Text>
            <Text style={[styles.selectedHeaderCount, { color: section.textColor }]}>{filteredOrders.length} orders</Text>
          </View>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>{section.emoji}</Text>
              <Text style={styles.emptyText}>No {section.label} orders!</Text>
            </View>
          ) : (
            filteredOrders.map((order, index) => {
              const fields = order.fields || {};
              const status = fields.status?.stringValue || "Placed";
              const orderId = (order.name || "").split("/").pop();
              return (
                <View key={index} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View>
                      <Text style={styles.orderId}>#{orderId.slice(-6)}</Text>
                      <Text style={styles.orderTime}>
                        {fields.createdAt?.stringValue
                          ? new Date(fields.createdAt.stringValue).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
                          : "📅 " + new Date(order.createTime || Date.now()).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                      <Text style={[styles.statusText, { color: getStatusTextColor(status) }]}>{status}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerName}>{fields.name?.stringValue}</Text>
                  <Text style={styles.customerPhone}>{fields.phone?.stringValue}</Text>
                  <Text style={styles.customerAddress}>{fields.address?.stringValue}</Text>
                  <Text style={styles.deliverySlot}>🕐 {fields.selectedSlot?.stringValue}</Text>
                  <Text style={styles.orderTotal}>💰 Rs.{fields.total?.integerValue}</Text>

                  <TouchableOpacity
                    style={styles.productsToggle}
                    onPress={() => setExpandedOrder(expandedOrder === orderId ? null : orderId)}
                  >
                    <Text style={styles.productsToggleText}>
                      {expandedOrder === orderId ? "▼ Hide Items" : "▶ View Items"}
                    </Text>
                  </TouchableOpacity>

                  {expandedOrder === orderId && (
                    <View style={styles.productsList}>
                      {(() => {
                        try {
                          const items = JSON.parse(fields.items?.stringValue || "[]");
                          return items.length > 0 ? items.map((item, i) => (
                            <View key={i} style={styles.orderedItem}>
                              <Text style={styles.orderedItemEmoji}>{item.emoji || "🛒"}</Text>
                              <Text style={styles.orderedItemName}>{item.name}</Text>
                              <Text style={styles.orderedItemQty}>x{item.qty}</Text>
                              <Text style={styles.orderedItemPrice}>{item.price}</Text>
                            </View>
                          )) : <Text style={styles.noItemsText}>No items</Text>;
                        } catch(e) {
                          return <Text style={styles.noItemsText}>Items unavailable</Text>;
                        }
                      })()}
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    {["Processing", "Out for Delivery", "Delivered", "Cancelled"].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.actionBtn, status === s && styles.actionBtnActive]}
                        onPress={() => updateOrderStatus(order.name, s)}
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
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live • {lastUpdated.toLocaleTimeString()}</Text>
          <TouchableOpacity style={styles.refreshSmallBtn} onPress={() => { fetchOrders(); setLastUpdated(new Date()); }}>
            <Text style={styles.refreshSmallBtnText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Orders Overview</Text>
        <View style={styles.ordersGrid}>
          {sections.map(section => (
            <TouchableOpacity
              key={section.key}
              style={[styles.orderBox, { backgroundColor: section.color }]}
              onPress={() => setSelectedStatus(section.key)}
            >
              <Text style={styles.orderBoxEmoji}>{section.emoji}</Text>
              <Text style={[styles.orderBoxCount, { color: section.textColor }]}>
                {categorized[section.key].length}
              </Text>
              <Text style={[styles.orderBoxLabel, { color: section.textColor }]}>{section.label}</Text>
              <Text style={[styles.orderBoxTap, { color: section.textColor }]}>Tap to view →</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Total Revenue</Text>
        <View style={styles.revenueBox}>
          <Text style={styles.revenueEmoji}>💰</Text>
          <Text style={styles.revenueAmount}>Rs.{getTotalRevenue()}</Text>
          <Text style={styles.revenueLabel}>from {orders.length} orders</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const renderProducts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.stockSummary}>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#D4EDDA" }]}>
          <Text style={styles.stockSummaryNum}>{allProducts.length}</Text>
          <Text style={styles.stockSummaryLabel}>Total</Text>
        </View>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#FFF3CD" }]}>
          <Text style={styles.stockSummaryNum}>{Object.keys(categoryCounts).length}</Text>
          <Text style={styles.stockSummaryLabel}>Categories</Text>
        </View>
        <View style={[styles.stockSummaryCard, { backgroundColor: "#CCE5FF" }]}>
          <Text style={styles.stockSummaryNum}>{adminProducts.length}</Text>
          <Text style={styles.stockSummaryLabel}>Custom</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>By Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <View key={cat} style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{cat}</Text>
            <Text style={styles.categoryChipCount}>{count}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.filterRow}>
        {["all", "low", "out"].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, stockFilter === f && styles.filterBtnActive]} onPress={() => setStockFilter(f)}>
            <Text style={[styles.filterBtnText, stockFilter === f && styles.filterBtnTextActive]}>
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddProduct(true)}>
        <Text style={styles.addBtnText}>+ Add New Product</Text>
      </TouchableOpacity>

      {filteredProducts.map((product, index) => (
        <TouchableOpacity key={index} style={styles.productCard} onPress={() => { setViewingProduct(product); setShowProductDetail(true); }}>
          <View style={styles.productRow}>
            <Text style={styles.productEmoji}>{product.emoji || "🛒"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>Rs.{product.price} | {product.unit}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <View style={[styles.stockBadge, { backgroundColor: getStockColor(product.stock) }]}>
                <Text style={[styles.stockBadgeText, { color: getStockTextColor(product.stock) }]}>{getStockLabel(product.stock)}</Text>
              </View>
              <Text style={styles.stockCount}>Stock: {product.stock}</Text>
              {!product.isBuiltIn && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteProduct(product.path)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderCustomers = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.statCard, { backgroundColor: "#E8D5FF", width: "100%", marginBottom: 16 }]}>
        <Text style={styles.statEmoji}>👥</Text>
        <Text style={styles.statNumber}>{customers.length}</Text>
        <Text style={styles.statLabel}>Total Registered Users</Text>
      </View>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchCustomers}>
        <Text style={styles.refreshBtnText}>🔄 Refresh Users</Text>
      </TouchableOpacity>
      {customers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyText}>No users yet!</Text>
        </View>
      ) : customers.map((customer, index) => {
        const fields = customer.fields || {};
        const uid = fields.uid?.stringValue;
        const orderCount = orders.filter(o => o.fields?.userId?.stringValue === uid).length;
        return (
          <View key={index} style={styles.customerCard}>
            <Text style={styles.customerCardIcon}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerCardName}>{fields.displayName?.stringValue || "User"}</Text>
              <Text style={styles.customerCardEmail}>{fields.email?.stringValue}</Text>
              <Text style={styles.customerCardDate}>Last login: {new Date(fields.lastLogin?.stringValue || Date.now()).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: orderCount > 0 ? "#D4EDDA" : "#f0f0f0" }]}>
              <Text style={[styles.stockBadgeText, { color: orderCount > 0 ? "#155724" : "#888" }]}>{orderCount} orders</Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderAccount = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.adminProfileCard}>
        <Text style={styles.adminProfileIcon}>👑</Text>
        <Text style={styles.adminProfileTitle}>Admin Account</Text>
        <Text style={styles.adminProfileEmail}>{adminInfo?.email || "kadaiveedhi.admin@gmail.com"}</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>✅ Admin Access</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#E5FFE5" }]}>
          <Text style={styles.statEmoji}>📦</Text>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E8D5FF" }]}>
          <Text style={styles.statEmoji}>👥</Text>
          <Text style={styles.statNumber}>{customers.length}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFE5CC" }]}>
          <Text style={styles.statEmoji}>🛍️</Text>
          <Text style={styles.statNumber}>{allProducts.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#E5FFE5" }]}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statNumber}>Rs.{getTotalRevenue()}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Logout from Admin</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kadai Veedhi Admin</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.exitBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1A2E1A" style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "customers" && renderCustomers()}
          {activeTab === "account" && renderAccount()}
        </View>
      )}

      <View style={styles.bottomTab}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} style={[styles.bottomTabBtn, activeTab === tab.key && styles.bottomTabBtnActive]} onPress={() => setActiveTab(tab.key)}>
            <Text style={styles.bottomTabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.bottomTabLabel, activeTab === tab.key && styles.bottomTabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showProductDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Product Details</Text>
              <TouchableOpacity onPress={() => setShowProductDetail(false)}>
                <Text style={{ fontSize: 18, color: "#888" }}>X</Text>
              </TouchableOpacity>
            </View>
            {viewingProduct && (
              <ScrollView>
                <View style={{ alignItems: "center", padding: 20, backgroundColor: "#F8F9FA", borderRadius: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 60, marginBottom: 8 }}>{viewingProduct.emoji || "🛒"}</Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1A2E1A" }}>{viewingProduct.name}</Text>
                </View>
                {[
                  { label: "Price", value: "Rs." + viewingProduct.price },
                  { label: "Unit", value: viewingProduct.unit },
                  { label: "Category", value: viewingProduct.category },
                  { label: "Stock", value: String(viewingProduct.stock) },
                  { label: "Type", value: viewingProduct.isBuiltIn ? "Built-in" : "Custom" },
                ].map((row, i) => (
                  <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#fff", borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#eee" }}>
                    <Text style={{ color: "#888" }}>{row.label}</Text>
                    <Text style={{ fontWeight: "600", color: "#1A2E1A" }}>{row.value}</Text>
                  </View>
                ))}
                <View style={{ gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#CCE5FF" }]} onPress={() => { setShowProductDetail(false); openEditProduct(viewingProduct); }}>
                    <Text style={{ color: "#004085", fontWeight: "600", textAlign: "center" }}>Edit Product</Text>
                  </TouchableOpacity>
                  {!viewingProduct.isBuiltIn && (
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#F8D7DA" }]} onPress={() => { setShowProductDetail(false); deleteProduct(viewingProduct.path); }}>
                      <Text style={{ color: "#721C24", fontWeight: "600", textAlign: "center" }}>Delete Product</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#1A2E1A" }]} onPress={() => setShowProductDetail(false)}>
                    <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showEditProduct} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEditProduct(false)}>
                <Text style={{ fontSize: 18, color: "#888" }}>X</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { key: "name", placeholder: "Product Name *" },
                { key: "price", placeholder: "Price *" },
                { key: "unit", placeholder: "Unit (e.g. per kg)" },
                { key: "category", placeholder: "Category" },
                { key: "emoji", placeholder: "Emoji" },
                { key: "stock", placeholder: "Stock Count" },
              ].map((field) => (
                <TextInput
                  key={field.key}
                  style={styles.modalInput}
                  placeholder={field.placeholder}
                  value={editForm[field.key]}
                  onChangeText={(text) => setEditForm({ ...editForm, [field.key]: text })}
                  placeholderTextColor="#aaa"
                  keyboardType={field.key === "stock" || field.key === "price" ? "numeric" : "default"}
                />
              ))}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#eee" }]} onPress={() => setShowEditProduct(false)}>
                <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#1A2E1A" }]} onPress={saveEditProduct}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  exitBtn: { color: "#C4622D", fontWeight: "600", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A", marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", borderRadius: 16, padding: 14, alignItems: "center" },
  statEmoji: { fontSize: 26, marginBottom: 4 },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  statLabel: { fontSize: 11, color: "#555", marginTop: 2 },
  recentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  orderTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  orderId: { fontSize: 13, fontWeight: "bold", color: "#1A2E1A" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  customerName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  customerPhone: { fontSize: 12, color: "#888", marginTop: 2 },
  customerAddress: { fontSize: 11, color: "#888", marginTop: 2 },
  deliverySlot: { fontSize: 11, color: "#555", marginTop: 4 },
  orderTotal: { fontSize: 13, fontWeight: "bold", color: "#C4622D", marginTop: 4 },
  refreshBtn: { backgroundColor: "#E5FFE5", borderRadius: 12, padding: 12, alignItems: "center", marginBottom: 12 },
  refreshBtnText: { color: "#1A2E1A", fontWeight: "600" },
  orderCard: { backgroundColor: "#fff", marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#eee" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#1A2E1A" },
  actionBtnActive: { backgroundColor: "#1A2E1A" },
  actionBtnText: { fontSize: 11, color: "#1A2E1A", fontWeight: "500" },
  actionBtnTextActive: { color: "#fff" },
  stockSummary: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stockSummaryCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  stockSummaryNum: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  stockSummaryLabel: { fontSize: 10, color: "#555", marginTop: 2 },
  categoryChip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: "#eee", alignItems: "center" },
  categoryChipText: { fontSize: 11, color: "#1A2E1A", fontWeight: "600" },
  categoryChipCount: { fontSize: 14, fontWeight: "bold", color: "#C4622D" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  filterBtnActive: { backgroundColor: "#1A2E1A" },
  filterBtnText: { fontSize: 11, color: "#888", fontWeight: "600" },
  filterBtnTextActive: { color: "#fff" },
  addBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 10 },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  productCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  productEmoji: { fontSize: 26 },
  productName: { fontSize: 13, fontWeight: "600", color: "#1A2E1A" },
  productPrice: { fontSize: 12, color: "#C4622D", marginTop: 2 },
  productCategory: { fontSize: 11, color: "#888" },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stockBadgeText: { fontSize: 10, fontWeight: "600" },
  stockCount: { fontSize: 11, color: "#888" },
  deleteBtn: { backgroundColor: "#F8D7DA", borderRadius: 6, padding: 5 },
  deleteBtnText: { color: "#721C24", fontWeight: "600", fontSize: 11 },
  customerCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#eee", flexDirection: "row", alignItems: "center", gap: 10 },
  customerCardIcon: { fontSize: 28 },
  customerCardName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  customerCardEmail: { fontSize: 12, color: "#888" },
  customerCardDate: { fontSize: 11, color: "#aaa", marginTop: 2 },
  adminProfileCard: { backgroundColor: "#1A2E1A", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 20 },
  adminProfileIcon: { fontSize: 60, marginBottom: 8 },
  adminProfileTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  adminProfileEmail: { fontSize: 13, color: "#aaa", marginTop: 4 },
  adminBadge: { backgroundColor: "#C4622D", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12 },
  adminBadgeText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  logoutBtn: { backgroundColor: "#C4622D", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  logoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  emptyBox: { alignItems: "center", marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  bottomTab: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee", paddingBottom: 8, paddingTop: 8 },
  bottomTabBtn: { flex: 1, alignItems: "center", paddingVertical: 4 },
  bottomTabBtnActive: { borderTopWidth: 2, borderTopColor: "#1A2E1A" },
  bottomTabEmoji: { fontSize: 20 },
  bottomTabLabel: { fontSize: 9, color: "#888", marginTop: 2 },
  bottomTabLabelActive: { color: "#1A2E1A", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A", marginBottom: 16 },
  modalInput: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: "#eee", color: "#1A2E1A" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  liveRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5FFE5", borderRadius: 12, padding: 10, marginBottom: 12, gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#28a745" },
  liveText: { flex: 1, fontSize: 12, color: "#155724", fontWeight: "500" },
  refreshSmallBtn: { backgroundColor: "#1A2E1A", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  refreshSmallBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  productsToggle: { backgroundColor: "#F0F8F0", borderRadius: 8, padding: 8, marginTop: 8, alignItems: "center" },
  productsToggleText: { color: "#1A2E1A", fontSize: 12, fontWeight: "600" },
  productsList: { backgroundColor: "#F8F9FA", borderRadius: 8, padding: 8, marginTop: 6 },
  orderedItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#eee", gap: 8 },
  orderedItemEmoji: { fontSize: 18 },
  orderedItemName: { flex: 1, fontSize: 13, color: "#1A2E1A", fontWeight: "500" },
  orderedItemQty: { fontSize: 12, color: "#888" },
  orderedItemPrice: { fontSize: 13, color: "#C4622D", fontWeight: "600" },
  noItemsText: { fontSize: 12, color: "#888", textAlign: "center", padding: 8 },
  orderSection: { marginBottom: 16 },
  orderSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 8 },
  orderSectionTitle: { fontSize: 15, fontWeight: "bold" },
  orderSectionCount: { fontSize: 20, fontWeight: "bold" },
  emptySectionBox: { backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#eee", marginBottom: 4 },
  emptySectionText: { fontSize: 13, color: "#aaa" },
  orderTime: { fontSize: 11, color: "#888" },
  ordersGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  orderBox: { width: "47%", borderRadius: 16, padding: 16, alignItems: "center" },
  orderBoxEmoji: { fontSize: 32, marginBottom: 8 },
  orderBoxCount: { fontSize: 32, fontWeight: "bold" },
  orderBoxLabel: { fontSize: 13, fontWeight: "600", marginTop: 4, textAlign: "center" },
  orderBoxTap: { fontSize: 10, marginTop: 6, opacity: 0.7 },
  backBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, padding: 12, marginBottom: 12 },
  backBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  selectedHeader: { borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 16, flexDirection: "row", gap: 12 },
  selectedHeaderEmoji: { fontSize: 30 },
  selectedHeaderTitle: { fontSize: 18, fontWeight: "bold", flex: 1 },
  selectedHeaderCount: { fontSize: 22, fontWeight: "bold" },
  revenueBox: { backgroundColor: "#E5FFE5", borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 16 },
  revenueEmoji: { fontSize: 40, marginBottom: 8 },
  revenueAmount: { fontSize: 32, fontWeight: "bold", color: "#1A2E1A" },
  revenueLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  catDetailHeader: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  catDetailEmoji: { fontSize: 40 },
  catDetailTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  catDetailCount: { fontSize: 13, color: "#888", marginTop: 4 },
  catDetailHeader: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#eee" },
  catDetailEmoji: { fontSize: 40 },
  catDetailTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  catDetailCount: { fontSize: 13, color: "#888", marginTop: 4 },
});
























































