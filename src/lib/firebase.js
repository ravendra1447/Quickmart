import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCI6JWjgycSSSJLl6wo6ok4O81aGpSDzEg",
  authDomain: "instantgrocery-7f891.firebaseapp.com",
  projectId: "instantgrocery-7f891",
  storageBucket: "instantgrocery-7f891.firebasestorage.app",
  messagingSenderId: "626341326507",
  appId: "1:626341326507:web:063510a7e081b8310bd1ee"
};

let app;
export let messaging;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging not supported in this browser:", error);
  }
}

export const requestFCMToken = async () => {
  if (!messaging) return null;
  try {
    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // REPLACE vapidKey WITH YOUR ACTUAL KEY
      const currentToken = await getToken(messaging, { 
        vapidKey: 'BDUId6qv98n7r8ANN_0Lzl6I74zlvWhHMESRKOfLfyMEBCMrP-nrG1Hw05O-lzrRqEZ1V5zUXnPoZOKav0F-6RU' 
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
