import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.REACT_APP_GEMINI_API_KEY || import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiTools = (habitActions) => [
  {
    functionDeclarations: [
      {
        name: "addHabit",
        description: "Add a new habit for the active month.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            icon: { type: "STRING" },
            category: { type: "STRING" },
          },
          required: ["title"],
        },
      },
      {
        name: "editHabit",
        description: "Rename an existing habit by habitId.",
        parameters: {
          type: "OBJECT",
          properties: {
            habitId: { type: "STRING" },
            newTitle: { type: "STRING" },
          },
          required: ["habitId", "newTitle"],
        },
      },
      {
        name: "deleteHabit",
        description: "Delete a habit by habitId.",
        parameters: {
          type: "OBJECT",
          properties: {
            habitId: { type: "STRING" },
          },
          required: ["habitId"],
        },
      },
      {
        name: "toggleHabitCompletion",
        description: "Toggle a habit done or undone for a specific day.",
        parameters: {
          type: "OBJECT",
          properties: {
            habitId: { type: "STRING" },
            date: { type: "STRING", description: "ISO date like 2026-09-08" },
          },
          required: ["habitId", "date"],
        },
      },
      {
        name: "cloneHabitsToNextMonth",
        description: "Copy the currently active month's habits to the next month without completion ticks.",
        parameters: {
          type: "OBJECT",
          properties: {
            sourceMonth: { type: "STRING" },
            targetMonth: { type: "STRING" },
          },
        },
      },
    ],
  },
];

export async function chatWithGemini({ prompt, actions }) {
  if (!ai) {
    return {
      text: "Gemini is not configured. Set the VITE_GEMINI_API_KEY env variable to enable the AI assistant.",
      toolCalls: [],
      configured: false,
    };
  }

  const tools = getGeminiTools(actions);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools,
    });

    const functionCalls = response.functionCalls || [];
    const text = response.text || "I’m ready to help you optimize your habits.";

    return {
      text,
      toolCalls: functionCalls,
      configured: true,
    };
  } catch (error) {
    return {
      text: `AI request failed: ${error.message}`,
      toolCalls: [],
      configured: true,
      error: error.message,
    };
  }
}

export function summarizeHabitCommand(name, payload) {
  if (name === "addHabit") return `Add habit ${payload.title}`;
  if (name === "editHabit") return `Rename habit ${payload.habitId}`;
  if (name === "deleteHabit") return `Delete habit ${payload.habitId}`;
  if (name === "toggleHabitCompletion") return `Toggle habit ${payload.habitId} for ${payload.date}`;
  if (name === "cloneHabitsToNextMonth") return "Clone current month habits into the next month";
  return name;
}
