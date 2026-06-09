import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
