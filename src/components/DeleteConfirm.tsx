import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type Props = {
  open: boolean;
  company: string;
  role: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteConfirm({ open, company, role, onCancel, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Confirm deletion"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="text-rose-600" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-slate-900">
              Delete this application?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{company}</span> —{' '}
              {role} will be permanently removed. This cannot be undone.
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
