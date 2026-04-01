
// // src/firebase/config.js
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyBsZ0zg0UHkEPKc3AqVTnGjWeT_bceyzJk",
//   authDomain: "mydopamine-48c28.firebaseapp.com",
//   projectId: "mydopamine-48c28",
//   storageBucket: "mydopamine-48c28.firebasestorage.app",
//   messagingSenderId: "603255442030",
//   appId: "1:603255442030:web:f2156202251bc20948b47f",
//   measurementId: "G-TFZ8M6KJ1R"
// };

// const app = initializeApp(firebaseConfig);

// // ✅ Export db and auth - these are REQUIRED by firebaseService.js
// export const db = getFirestore(app);
// export const auth = getAuth(app);

// export default app;



// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsZ0zg0UHkEPKc3AqVTnGjWeT_bceyzJk",
  authDomain: "mydopamine-48c28.firebaseapp.com",
  projectId: "mydopamine-48c28",
  storageBucket: "mydopamine-48c28.firebasestorage.app",
  messagingSenderId: "603255442030",
  appId: "1:603255442030:web:f2156202251bc20948b47f",
  measurementId: "G-TFZ8M6KJ1R"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;