import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Target, Mail, Lock, User, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let result;
    if (isLogin) {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password, name);
    }
    
    console.log("Login result:", result); // Add this to debug
    
    if (result && result.success) {
      // Force redirect to dashboard
      window.location.href = "/dashboard";
      // OR use navigate if you have it
      // navigate("/dashboard");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Login failed");
  } finally {
    setLoading(false);
  }
};


  // In Login.jsx — replace handleGuestLogin with:
const handleGuestLogin = () => {
  localStorage.setItem("guest_mode", "true"); // ✅ Set the flag first
  window.location.href = "/dashboard";
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4">
              <Target size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Discipline Tracker</h1>
            <p className="text-slate-500 mt-2">Build better habits, one day at a time</p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                isLogin ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                !isLogin ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-violet-600 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  {isLogin ? "Login" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
          >
            Continue as Guest
          </button>

          <p className="text-xs text-slate-400 text-center mt-6">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}