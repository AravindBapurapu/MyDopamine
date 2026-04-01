import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";

class FirebaseService {
  // Authentication methods
  async signUp(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        settings: {
          theme: "light",
          notifications: true
        }
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Habit data methods
  async saveHabits(userId, monthKey, habits) {
    try {
      const habitRef = doc(db, "habits", `${userId}_${monthKey}`);
      await setDoc(habitRef, {
        userId,
        monthKey,
        habits,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error saving habits:", error);
      return { success: false, error: error.message };
    }
  }

  async loadHabits(userId, monthKey) {
    try {
      const habitRef = doc(db, "habits", `${userId}_${monthKey}`);
      const habitDoc = await getDoc(habitRef);
      
      if (habitDoc.exists()) {
        return { success: true, data: habitDoc.data().habits };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error("Error loading habits:", error);
      return { success: false, error: error.message };
    }
  }

  async loadAllUserMonths(userId) {
    try {
      const habitsRef = collection(db, "habits");
      const q = query(habitsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const monthsData = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        monthsData[data.monthKey] = data.habits;
      });
      
      return { success: true, data: monthsData };
    } catch (error) {
      console.error("Error loading all months:", error);
      return { success: false, error: error.message };
    }
  }

  // User settings
  async getUserSettings(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data().settings };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error("Error loading user settings:", error);
      return { success: false, error: error.message };
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { settings });
      return { success: true };
    } catch (error) {
      console.error("Error updating settings:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();