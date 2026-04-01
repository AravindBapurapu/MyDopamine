// // import { TriangleAlert } from "lucide-react";
// import { AlertTriangle } from "lucide-react";

// export default function ConfirmModal({
//   open,
//   title,
//   message,
//   onCancel,
//   onConfirm,
// }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
//       <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
//         <div className="flex items-center gap-3">
//           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
//             <AlertTriangle size={24} />
//           </div>
//           <div>
//             <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
//             <p className="text-sm text-slate-500">{message}</p>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="rounded-2xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { AlertTriangle } from "lucide-react";  // Changed from TriangleAlert

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <AlertTriangle size={24} />  {/* Changed here too */}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}