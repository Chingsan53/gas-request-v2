import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR1JtspOmbaZW2FXMGIo9_eb96OXV4R60",
  authDomain: "gas-discount.firebaseapp.com",
  projectId: "gas-discount",
  storageBucket: "gas-discount.appspot.com",
  messagingSenderId: "767277077984",
  appId: "1:767277077984:web:edc0f313f3470d5ce7c785",
  measurementId: "G-FK7VSS69FS",
};

const app = initializeApp(firebaseConfig);

//firestore
const db = getFirestore(app);

//export db
export { db };
const analytics = getAnalytics(app);
