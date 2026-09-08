import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const LOCAL_STORAGE_KEY = "mydopamine_habits_cache";

class FirebaseService {
  async signUp(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        settings: {
          theme: "dark",
          notifications: true,
        },
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

  getUserMonthDocPath(userId, monthKey) {
    return `users/${userId}/years/${monthKey.split('-')[0]}/months/${monthKey}/habits`;
  }

  readLocalCache() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  writeLocalCache(data) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore localStorage write errors for privacy/sandboxed modes
    }
  }

  async saveHabits(userId, monthKey, habits) {
    if (!userId) {
      const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
      this.writeLocalCache({ ...this.readLocalCache(), [monthKey]: safeHabits });
      return { success: true, offline: true };
    }

    try {
      const safeHabits = Array.isArray(habits)
        ? habits.filter(Boolean).map((habit) => ({
            ...habit,
            progress: habit?.progress || {},
          }))
        : [];

      const docRef = doc(db, "users", userId, "years", String(monthKey.split('-')[0]), "months", monthKey, "habits");
      await setDoc(docRef, {
        userId,
        monthKey,
        habits: safeHabits,
        updatedAt: serverTimestamp(),
        syncedAt: serverTimestamp(),
      }, { merge: true });
      const cache = this.readLocalCache();
      this.writeLocalCache({ ...cache, [monthKey]: safeHabits });
      return { success: true, offline: false };
    } catch (error) {
      const safeHabits = Array.isArray(habits) ? habits.filter(Boolean) : [];
      const cache = this.readLocalCache();
      this.writeLocalCache({ ...cache, [monthKey]: safeHabits });
      return { success: false, offline: true, error: error.message };
    }
  }

  async loadHabits(userId, monthKey) {
    if (!userId) {
      const cache = this.readLocalCache();
      return { success: true, data: cache[monthKey] || [] };
    }

    try {
      const docRef = doc(db, "users", userId, "years", String(monthKey.split('-')[0]), "months", monthKey, "habits");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const habits = docSnap.data().habits || [];
        const cache = this.readLocalCache();
        this.writeLocalCache({ ...cache, [monthKey]: habits });
        return { success: true, data: habits };
      }

      const cache = this.readLocalCache();
      return { success: true, data: cache[monthKey] || null };
    } catch (error) {
      const cache = this.readLocalCache();
      return { success: true, data: cache[monthKey] || [], offline: true };
    }
  }

  async loadAllUserMonths(userId) {
    try {
      const yearsDir = collection(db, "users", userId, "years");
      const yearDocs = await getDocs(yearsDir);
      const monthsData = {};
      for (const yearDoc of yearDocs.docs) {
        const monthCollection = collection(db, "users", userId, "years", yearDoc.id, "months");
        const monthDocs = await getDocs(monthCollection);
        monthDocs.forEach((monthDoc) => {
          const monthData = monthDoc.data();
          if (monthData && Array.isArray(monthData.habits)) {
            monthsData[monthDoc.id] = monthData.habits;
          }
        });
      }
      return { success: true, data: monthsData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserSettings(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) return { success: true, data: userDoc.data().settings || null };
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { settings });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();