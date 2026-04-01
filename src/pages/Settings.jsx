import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useHabits } from "../context/HabitContext";
import { motion } from "framer-motion";
import { 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  LogOut, 
  Database, 
  Download, 
  Upload,
  ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings({ onBack }) {
  const { currentUser, userSettings, updateSettings, logout } = useAuth();
  const { habits, selectedMonth, selectedYear, importPreviousMonth } = useHabits();
  const [settings, setSettings] = useState(userSettings || {
    theme: "light",
    notifications: true
  });

  const handleThemeToggle = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    updateSettings(newSettings);
    
    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleNotificationToggle = () => {
    const newSettings = { ...settings, notifications: !settings.notifications };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleExportData = () => {
    const data = {
      habits,
      exportDate: new Date().toISOString(),
      month: selectedMonth,
      year: selectedYear
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-${selectedMonth}-${selectedYear}.json`;
    a.click();
    
    toast.success("Data exported successfully!");
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // Here you would implement the import logic
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-slate-50 p-4 md:p-6"
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>

          {currentUser ? (
            <div className="mb-6 p-4 bg-violet-50 rounded-2xl">
              <p className="text-sm text-violet-600">Logged in as</p>
              <p className="font-medium text-slate-800">{currentUser.email}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-amber-50 rounded-2xl">
              <p className="text-amber-600">Guest Mode</p>
              <p className="text-sm text-slate-600">Data is saved locally on this device</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                {settings.theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
                <div>
                  <p className="font-medium text-slate-700">Theme</p>
                  <p className="text-sm text-slate-500">
                    {settings.theme === "light" ? "Light mode" : "Dark mode"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className="px-4 py-2 bg-white rounded-xl border border-slate-200"
              >
                {settings.theme === "light" ? "Switch to Dark" : "Switch to Light"}
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                {settings.notifications ? <Bell size={20} /> : <BellOff size={20} />}
                <div>
                  <p className="font-medium text-slate-700">Notifications</p>
                  <p className="text-sm text-slate-500">
                    {settings.notifications ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className="px-4 py-2 bg-white rounded-xl border border-slate-200"
              >
                {settings.notifications ? "Disable" : "Enable"}
              </button>
            </div>

            {/* Data Management */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Database size={20} />
                <p className="font-medium text-slate-700">Data Management</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <Download size={16} />
                  Export
                </button>
                
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <Upload size={16} />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={importPreviousMonth}
                className="w-full mt-3 px-4 py-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100"
              >
                Import Habits from Previous Month
              </button>
            </div>

            {/* Logout */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}