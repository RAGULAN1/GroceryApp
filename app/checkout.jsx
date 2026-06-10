import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useCart } from "./CartContext";

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const slots = ["9 AM - 12 PM", "12 PM - 3 PM", "3 PM - 6 PM", "6 PM - 9 PM"];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", phone: "", address: "", pincode: "", label: "Home" });
  const delivery = 40;
  const total = cartTotal + delivery;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem("kadai_addresses");
      if (saved) {
        const addrs = JSON.parse(saved);
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setName(addrs[0].name);
          setPhone(addrs[0].phone);
          setAddress(addrs[0].address);
          setPincode(addrs[0].pincode);
        }
      }
    } catch (e) {}
  };

  const saveAddress = async () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.address || !newAddr.pincode) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    try {
      const existing = await AsyncStorage.getItem("kadai_addresses");
      const addrs = existing ? JSON.parse(existing) : [];
      const updated = [newAddr, ...addrs].slice(0, 5);
      await AsyncStorage.setItem("kadai_addresses", JSON.stringify(updated));
      setSavedAddresses(updated);
      setName(newAddr.name);
      setPhone(newAddr.phone);
      setAddress(newAddr.address);
      setPincode(newAddr.pincode);
      setShowAddNew(false);
      setShowAddresses(false);
      setNewAddr({ name: "", phone: "", address: "", pincode: "", label: "Home" });
      Alert.alert("Saved!", "Address saved!");
    } catch (e) {}
  };

  const selectAddress = (addr) => {
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(addr.address);
    setPincode(addr.pincode);
    setShowAddresses(false);
  };

  const deleteAddress = async (index) => {
    Alert.alert("Delete", "Remove this address?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const updated = savedAddresses.filter((_, i) => i !== index);
        await AsyncStorage.setItem("kadai_addresses", JSON.stringify(updated));
        setSavedAddresses(updated);
      }},
    ]);
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access!");
        return;
      }
      Alert.alert("Getting Location", "Please wait...");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) {
        const place = geocode[0];
        const fullAddress = [place.name, place.street, place.district, place.city].filter(Boolean).join(", ");
        setAddress(fullAddress);
        setPincode(place.postalCode || "");
        Alert.alert("Done!", "Location filled!");
      }
    } catch (err) {
      Alert.alert("Error", "Could not get location.");
    }
  };

  const placeOrder = async () => {
    if (!name || !phone || !address || !pincode || !selectedSlot) {
      Alert.alert("Missing Fields", "Please fill in all fields!");
      return;
    }
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("kadai_user");
      const user = userStr ? JSON.parse(userStr) : {};

      const orderData = {
        fields: {
          name: { stringValue: name },
          phone: { stringValue: phone },
          address: { stringValue: address },
          pincode: { stringValue: pincode },
          selectedSlot: { stringValue: selectedSlot },
          total: { integerValue: total },
          deliveryFee: { integerValue: delivery },
          status: { stringValue: "Placed" },
          createdAt: { stringValue: new Date().toISOString() },
          userId: { stringValue: user.uid || "" },
          items: { stringValue: JSON.stringify(cartItems) },
        }
      };

      const res = await fetch(
        `${BASE_URL}/orders?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      if (res.ok) {
        clearCart();
        Alert.alert("Order Placed! 🎉", "Your order has been placed successfully!", [
          { text: "OK", onPress: () => router.push("/(tabs)") },
        ]);
      } else {
        Alert.alert("Error", "Failed to place order!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {savedAddresses.length > 0 && (
            <TouchableOpacity onPress={() => setShowAddresses(true)}>
              <Text style={styles.changeBtn}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {savedAddresses.length > 0 && (
          <TouchableOpacity style={styles.savedAddrBtn} onPress={() => setShowAddresses(true)}>
            <Text style={styles.savedAddrIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedAddrName}>{name}</Text>
              <Text style={styles.savedAddrText} numberOfLines={1}>{address}</Text>
            </View>
            <Text style={styles.savedAddrArrow}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} placeholder="10-digit mobile number" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />

        <View style={styles.addressLabelRow}>
          <Text style={styles.label}>Street Address *</Text>
          <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
            <Text style={styles.locationBtnText}>📍 Use Location</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={[styles.input, { height: 80 }]} placeholder="Door no, Street, Landmark" placeholderTextColor="#aaa" value={address} onChangeText={setAddress} multiline textAlignVertical="top" />

        <Text style={styles.label}>Pincode *</Text>
        <TextInput style={styles.input} placeholder="6-digit pincode" placeholderTextColor="#aaa" value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} />

        <TouchableOpacity style={styles.addAddrBtn} onPress={() => setShowAddNew(true)}>
          <Text style={styles.addAddrBtnText}>+ Save this address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Slot</Text>
        <View style={styles.slotsGrid}>
          {slots.map((slot) => (
            <TouchableOpacity key={slot} style={[styles.slotBtn, selectedSlot === slot && styles.slotBtnActive]} onPress={() => setSelectedSlot(slot)}>
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <Text style={styles.itemEmoji}>{item.emoji || "🛒"}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.qty}</Text>
            <Text style={styles.itemPrice}>Rs.{parseInt(String(item.price || "0").replace("Rs.", "").trim()) * item.qty}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text>Rs.{cartTotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text>Rs.{delivery}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs.{total}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.placeOrderBtn, loading && styles.btnDisabled]} onPress={placeOrder} disabled={loading}>
        <Text style={styles.placeOrderText}>{loading ? "Placing Order..." : "Place Order - Rs." + total}</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />

      <Modal visible={showAddresses} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Addresses</Text>
              <TouchableOpacity onPress={() => setShowAddresses(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {savedAddresses.map((addr, index) => (
                <TouchableOpacity key={index} style={styles.addrCard} onPress={() => selectAddress(addr)}>
                  <View style={styles.addrCardHeader}>
                    <Text style={styles.addrLabel}>{addr.label || "Home"}</Text>
                    <TouchableOpacity onPress={() => deleteAddress(index)}>
                      <Text style={styles.addrDelete}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.addrName}>{addr.name} | {addr.phone}</Text>
                  <Text style={styles.addrText}>{addr.address}, {addr.pincode}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addNewAddrBtn} onPress={() => { setShowAddresses(false); setShowAddNew(true); }}>
                <Text style={styles.addNewAddrBtnText}>+ Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddNew} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddNew(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>Label</Text>
              <View style={styles.labelRow}>
                {["Home", "Work", "Other"].map(l => (
                  <TouchableOpacity key={l} style={[styles.labelBtn, newAddr.label === l && styles.labelBtnActive]} onPress={() => setNewAddr({ ...newAddr, label: l })}>
                    <Text style={[styles.labelBtnText, newAddr.label === l && styles.labelBtnTextActive]}>
                      {l === "Home" ? "🏠 Home" : l === "Work" ? "🏢 Work" : "📍 Other"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="Enter name" value={newAddr.name} onChangeText={t => setNewAddr({ ...newAddr, name: t })} placeholderTextColor="#aaa" />
              <Text style={styles.label}>Phone *</Text>
              <TextInput style={styles.input} placeholder="Phone number" value={newAddr.phone} onChangeText={t => setNewAddr({ ...newAddr, phone: t })} keyboardType="phone-pad" placeholderTextColor="#aaa" />
              <Text style={styles.label}>Address *</Text>
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Door no, Street, Landmark" value={newAddr.address} onChangeText={t => setNewAddr({ ...newAddr, address: t })} multiline textAlignVertical="top" placeholderTextColor="#aaa" />
              <Text style={styles.label}>Pincode *</Text>
              <TextInput style={styles.input} placeholder="6-digit pincode" value={newAddr.pincode} onChangeText={t => setNewAddr({ ...newAddr, pincode: t })} keyboardType="numeric" maxLength={6} placeholderTextColor="#aaa" />
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#eee" }]} onPress={() => setShowAddNew(false)}>
                <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#1A2E1A" }]} onPress={saveAddress}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A2E1A", paddingHorizontal: 20, marginBottom: 16 },
  section: { backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#eee" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A" },
  changeBtn: { color: "#C4622D", fontWeight: "600", fontSize: 13 },
  savedAddrBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F8F0", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#C4E0C4" },
  savedAddrIcon: { fontSize: 20, marginRight: 8 },
  savedAddrName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  savedAddrText: { fontSize: 12, color: "#888", marginTop: 2 },
  savedAddrArrow: { fontSize: 20, color: "#888" },
  label: { fontSize: 13, fontWeight: "700", color: "#444", marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 14, color: "#222", backgroundColor: "#fafafa" },
  addressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 6 },
  locationBtn: { backgroundColor: "#1A2E1A", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  locationBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  addAddrBtn: { backgroundColor: "#F0F8F0", borderRadius: 10, padding: 10, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: "#C4E0C4" },
  addAddrBtnText: { color: "#1A2E1A", fontWeight: "600", fontSize: 13 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotBtn: { flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, alignItems: "center" },
  slotBtnActive: { borderColor: "#1A2E1A", backgroundColor: "#E8F5E8" },
  slotText: { fontSize: 12, color: "#555" },
  slotTextActive: { color: "#1A2E1A", fontWeight: "600" },
  summaryItem: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 },
  itemEmoji: { fontSize: 18 },
  itemName: { flex: 1, fontSize: 13, color: "#1A2E1A" },
  itemQty: { fontSize: 12, color: "#888" },
  itemPrice: { fontSize: 13, fontWeight: "600", color: "#C4622D" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: "#888" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#1A2E1A" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#C4622D" },
  placeOrderBtn: { backgroundColor: "#1A2E1A", borderRadius: 16, padding: 18, alignItems: "center", marginHorizontal: 20, marginBottom: 20 },
  btnDisabled: { opacity: 0.6 },
  placeOrderText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1A2E1A" },
  modalClose: { fontSize: 18, color: "#888" },
  addrCard: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  addrCardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  addrLabel: { backgroundColor: "#1A2E1A", color: "#fff", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: "600" },
  addrDelete: { fontSize: 16 },
  addrName: { fontSize: 14, fontWeight: "600", color: "#1A2E1A" },
  addrText: { fontSize: 12, color: "#888", marginTop: 2 },
  addNewAddrBtn: { backgroundColor: "#1A2E1A", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  addNewAddrBtnText: { color: "#fff", fontWeight: "bold" },
  labelRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  labelBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#eee" },
  labelBtnActive: { backgroundColor: "#1A2E1A", borderColor: "#1A2E1A" },
  labelBtnText: { fontSize: 12, color: "#888", fontWeight: "600" },
  labelBtnTextActive: { color: "#fff" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
});

