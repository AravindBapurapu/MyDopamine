import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import firebaseService from "../services/firebaseService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const settings = await firebaseService.getUserSettings(user.uid);
        if (settings.success && settings.data) {
          setUserSettings(settings.data);
        }
      } else {
        setUserSettings(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name) => {
    const result = await firebaseService.signUp(email, password, name);
    if (result.success) {
      toast.success("Account created successfully!");
    } else {
      toast.error(result.error);
    }
    return result;
  };

const signIn = async (email, password) => {
  try {
    const result = await firebaseService.signIn(email, password);
    console.log("Sign in result:", result); // Debug log
    
    if (result.success) {
      toast.success("Welcome back!");
      // Return the user data
      return { success: true, user: result.user };
    } else {
      toast.error(result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Sign in error:", error);
    toast.error("Login failed");
    return { success: false, error: error.message };
  }
};
  const logout = async () => {
    const result = await firebaseService.signOut();
    if (result.success) {
      toast.success("Logged out successfully");
    }
    return result;
  };

  const updateSettings = async (settings) => {
    if (!currentUser) return;
    const result = await firebaseService.updateUserSettings(currentUser.uid, settings);
    if (result.success) {
      setUserSettings(settings);
      toast.success("Settings updated");
    }
  };

  const value = {
    currentUser,
    loading,
    userSettings,
    signUp,
    signIn,
    logout,
    updateSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};