
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

// export const db = getFirestore(app);
// export const auth = getAuth(app);

// export default app;



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsZ0zg0UHkEPKc3AqVTnGjWeT_bceyzJk",
  authDomain: "mydopamine-48c28.firebaseapp.com",
  projectId: "mydopamine-48c28",
  storageBucket: "mydopamine-48c28.firebasestorage.app",
  messagingSenderId: "603255442030",
  appId: "1:603255442030:web:f2156202251bc20948b47f",
  measurementId: "G-TFZ8M6KJ1R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db for use in firebaseService and AuthContext
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;


