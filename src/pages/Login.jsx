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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,#070b14_0%,#0f172a_35%,#111827_100%)] px-4 py-12 text-slate-100 dark:bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,#070b14_0%,#0f172a_35%,#111827_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-md"
      >
        <div className="rounded-[32px] border border-cyan-400/20 bg-slate-950/70 p-8 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400 p-4 shadow-[0_0_28px_rgba(124,58,237,0.45)]">
              <Target size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">MyDopamine</h1>
            <p className="mt-2 text-sm text-slate-300">AI discipline cockpit for your daily momentum</p>
          </div>

          <div className="mb-6 flex gap-2 rounded-2xl bg-slate-900/80 p-1 ring-1 ring-slate-700/80">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-xl py-2.5 font-medium transition-all ${
                isLogin ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25" : "text-slate-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-xl py-2.5 font-medium transition-all ${
                !isLogin ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 py-3 font-medium text-white shadow-[0_8px_30px_rgba(34,211,238,0.28)] transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Please wait..." : <>{isLogin ? "Login" : "Create Account"}<ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-950/90 px-2 text-slate-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 font-medium text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
          >
            Continue as Guest
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}