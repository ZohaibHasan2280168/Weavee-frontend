// Import Firebase SDK compat versions in Service Worker context
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// TODO: Replace placeholders with your Firebase project's web configuration credentials
const firebaseConfig = {
  apiKey: "AIzaSyCE9CWCV4giEq9478oJmK_Putda2_zxBno",
  authDomain: "darziflow-8fa32.firebaseapp.com",
  projectId: "darziflow-8fa32",
  storageBucket: "darziflow-8fa32.firebasestorage.app",
  messagingSenderId: "176391217396",
  appId: "1:176391217396:web:76daa59fef10bacbf0bea1"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
