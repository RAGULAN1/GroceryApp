import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const FIREBASE_API_KEY = "AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ";
const PROJECT_ID = "kadai-veedhi";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Notification permission denied");
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "04d9bc57-15ad-42a1-9416-8caf02c91b6f",
    });
    return token.data;
  } catch (err) {
    console.log("Push token error:", err);
    return null;
  }
}

export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

export async function saveAdminPushToken(token) {
  try {
    await fetch(
      `${BASE_URL}/adminConfig/pushToken?key=${FIREBASE_API_KEY}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            token: { stringValue: token },
            updatedAt: { stringValue: new Date().toISOString() },
          }
        }),
      }
    );
    console.log("Admin push token saved!");
  } catch (err) {
    console.log("Error saving admin token:", err);
  }
}

export async function notifyAdmin(orderName, total, slot) {
  try {
    // Get admin push token from Firebase
    const res = await fetch(
      `${BASE_URL}/adminConfig/pushToken?key=${FIREBASE_API_KEY}`
    );
    const data = await res.json();
    const adminToken = data.fields?.token?.stringValue;

    if (!adminToken) {
      console.log("No admin token found");
      return;
    }

    // Send push notification via Expo
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        to: adminToken,
        title: "New Order Received! 🛒",
        body: `Order placed! Total: Rs.${total} | Slot: ${slot}`,
        sound: "default",
        priority: "high",
        data: { orderName, total, slot },
      }),
    });
    console.log("Admin notified!");
  } catch (err) {
    console.log("Error notifying admin:", err);
  }
}
