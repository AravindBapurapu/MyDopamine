// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HabitProvider } from "./context/HabitContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  // Allow logged-in users OR guests who clicked "Continue as Guest"
  if (!currentUser) {
    const guestMode = localStorage.getItem("guest_mode");
    if (!guestMode) return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <HabitProvider>
              <Dashboard />
            </HabitProvider>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#363636", color: "#fff", borderRadius: "12px" },
            success: { icon: "✅", style: { background: "#10b981" } },
            error: { icon: "❌", style: { background: "#ef4444" } },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}