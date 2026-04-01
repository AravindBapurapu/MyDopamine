import { useState } from "react";

export default function HabitNoteModal({ day, habit, onSave, onClose }) {

const [mood,setMood] = useState("moderate");
const [note,setNote] = useState("");

return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px] shadow-lg">

<h2 className="text-lg font-semibold mb-4">
Habit Reflection
</h2>

<div className="space-y-3">

<label className="block text-sm font-medium">
How was your performance?
</label>

<div className="flex gap-4">

<label className="flex items-center gap-2">
<input type="radio" value="bad"
checked={mood==="bad"}
onChange={()=>setMood("bad")} />
Bad
</label>

<label className="flex items-center gap-2">
<input type="radio" value="moderate"
checked={mood==="moderate"}
onChange={()=>setMood("moderate")} />
Moderate
</label>

<label className="flex items-center gap-2">
<input type="radio" value="good"
checked={mood==="good"}
onChange={()=>setMood("good")} />
Good
</label>

</div>

<textarea
className="w-full border rounded-lg p-2 mt-2"
placeholder="What did you do today?"
value={note}
onChange={(e)=>setNote(e.target.value)}
/>

<div className="flex justify-end gap-3 mt-4">

<button
className="px-4 py-2 rounded-lg bg-gray-300"
onClick={onClose}
>
Cancel
</button>

<button
className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
onClick={()=>onSave({mood,note})}
>
Save
</button>

</div>

</div>

</div>

</div>

);
}

