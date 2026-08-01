import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase Configuration mapping from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "darziflow-8fa32.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "darziflow-8fa32",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "darziflow-8fa32.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

/**
 * Requests notification permission from the user and retrieves the FCM Token.
 * @returns {Promise<string|null>} FCM registration token or null.
 */
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // VAPID key is required to retrieve the device token on web clients
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY",
      });
      if (token) {
        console.log("FCM Device Token retrieved:", token);
        return token;
      } else {
        console.log("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving FCM token:", error);
    return null;
  }
};

/**
 * Listener to receive push messages while the app is in the foreground.
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
