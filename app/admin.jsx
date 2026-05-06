import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const ADMIN_EMAIL = "kadaiveedhi.admin@gmail.com";

export default function AdminScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/kadai-veedhi/databases/(default)/documents/orders?key=${FIREBASE_API_KEY}`,
      );
      const data = await res.json();
      setOrders(data.documents || []);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch orders!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderPath, newStatus) => {
    try {
      const res = await fetch(
        `https://firestore.googleapis.com/v1/${orderPath}?updateMask.fieldPaths=status&key=${FIREBASE_API_KEY}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              status: { stringValue: newStatus },
            },
          }),
        },
      );
      if (res.ok) {
        Alert.alert("Updated!", `Order status changed to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update order!");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "#FFF3CD";
      case "Processing":
        return "#CCE5FF";
      case "Out for Delivery":
        return "#D4EDDA";
      case "Delivered":
        return "#D4EDDA";
      case "Cancelled":
        return "#F8D7DA";
      default:
        return "#FFF3CD";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Placed":
        return "#856404";
      case "Processing":
        return "#004085";
      case "Out for Delivery":
        return "#155724";
      case "Delivered":
        return "#155724";
      case "Cancelled":
        return "#721C24";
      default:
        return "#856404";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.exitBtn}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              orders.filter((o) => o.fields?.status?.stringValue === "Placed")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>New Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              orders.filter(
                (o) => o.fields?.status?.stringValue === "Delivered",
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "orders" && styles.tabActive]}
          onPress={() => setActiveTab("orders")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "orders" && styles.tabTextActive,
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.tabActive]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.tabTextActive,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1A2E1A"
          style={{ marginTop: 40 }}
        />
      ) : orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>No orders yet!</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order, index) => {
            const fields = order.fields || {};
            const status = fields.status?.stringValue || "Placed";
            const orderName = order.name || "";
            const orderId = orderName.split("/").pop();

            return (
              <View key={index} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderId}>Order #{orderId.slice(-6)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusTextColor(status) },
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerName}>
                  {fields.name?.stringValue}
                </Text>
                <Text style={styles.customerPhone}>
                  {fields.phone?.stringValue}
                </Text>
                <Text style={styles.customerAddress}>
                  {fields.address?.stringValue}
                </Text>
                <Text style={styles.deliverySlot}>
                  Slot: {fields.selectedSlot?.stringValue}
                </Text>
                <Text style={styles.orderTotal}>
                  Total: Rs.{fields.total?.integerValue}
                </Text>

                {/* Status Update Buttons */}
                <View style={styles.actionRow}>
                  {[
                    "Processing",
                    "Out for Delivery",
                    "Delivered",
                    "Cancelled",
                  ].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.actionBtn,
                        status === s && styles.actionBtnActive,
                      ]}
                      onPress={() => updateOrderStatus(orderName, s)}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          status === s && styles.actionBtnTextActive,
                        ]}
                      >
                        {s === "Out for Delivery" ? "Delivery" : s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A" },
  exitBtn: { color: "#C4622D", fontWeight: "600", fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 4 },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#1A2E1A" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#fff" },
  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A2E1A" },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: { fontSize: 13, fontWeight: "bold", color: "#1A2E1A" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },
  customerName: { fontSize: 15, fontWeight: "600", color: "#1A2E1A" },
  customerPhone: { fontSize: 13, color: "#888", marginTop: 2 },
  customerAddress: { fontSize: 12, color: "#888", marginTop: 2 },
  deliverySlot: { fontSize: 12, color: "#555", marginTop: 4 },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C4622D",
    marginTop: 4,
  },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1A2E1A",
  },
  actionBtnActive: { backgroundColor: "#1A2E1A" },
  actionBtnText: { fontSize: 11, color: "#1A2E1A", fontWeight: "500" },
  actionBtnTextActive: { color: "#fff" },
});
