import { useContext, useEffect, useMemo, useState } from "react";
import { BrainCircuit, Mic, Send, Sparkles } from "lucide-react";
import { HabitContext } from "../context/HabitContext";
import { chatWithGemini, summarizeHabitCommand } from "../services/geminiService";

export default function HUDAssistant() {
  const {
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabitCompletion,
    cloneHabitsToNextMonth,
    habits,
    selectedMonth,
    selectedYear,
  } = useContext(HabitContext);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "J.A.R.V.I.S. online. I can add habits, update progress, or clone this month into the next." },
  ]);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled] = useState(false);

  const handleToolAction = async (toolCall) => {
    const { name, args } = toolCall;
    let result = false;

    if (name === "addHabit") result = !!addHabit(args);
    if (name === "editHabit") result = !!editHabit(args);
    if (name === "deleteHabit") result = !!deleteHabit(args);
    if (name === "toggleHabitCompletion") result = !!toggleHabitCompletion(args);
    if (name === "cloneHabitsToNextMonth") result = !!cloneHabitsToNextMonth(args);

    return result;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const response = await chatWithGemini({
      prompt: `You are the JARVIS habit assistant for MyDopamine. Current month: ${selectedMonth} ${selectedYear}. Existing habits: ${habits.map((h) => h.name).join(", ") || "none"}. User request: ${userMessage}`,
      actions: {
        addHabit,
        editHabit,
        deleteHabit,
        toggleHabitCompletion,
        cloneHabitsToNextMonth,
      },
    });

    if (response.toolCalls?.length) {
      for (const call of response.toolCalls) {
        await handleToolAction(call);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: response.toolCalls?.length
          ? `${response.text || "Action executed."} ${response.toolCalls.map((call) => summarizeHabitCommand(call.name, call.args)).join(" • ")}`
          : response.text,
      },
    ]);
    setLoading(false);
  };

  const statusText = useMemo(() => (voiceEnabled ? "Voice HUD active" : "AI assistant online"), [voiceEnabled]);

  return (
    <div className="hud-panel hud-glow rounded-3xl p-4 text-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">AI COMMAND</p>
            <p className="text-sm font-semibold text-slate-100">J.A.R.V.I.S. Core</p>
          </div>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
          {statusText}
        </div>
      </div>

      <div className="custom-scrollbar max-h-64 space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
              message.role === "assistant"
                ? "bg-cyan-500/10 text-cyan-50"
                : "ml-auto bg-slate-700/80 text-slate-50"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
          title="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSend();
          }}
          className="flex-1 rounded-2xl border border-cyan-400/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Ask JARVIS to add a habit..."
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
