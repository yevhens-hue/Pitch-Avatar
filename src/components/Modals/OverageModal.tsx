import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OverageModal({ isOpen, onClose }: OverageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enrollment Seats Quota Exceeded</h2>
          <p className="text-sm text-gray-600">
            You have reached your limit of Enrollment Seats. 
            To send new assignments, you need to either purchase additional seats or archive/delete older inactive assignments.
          </p>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col gap-3">
          <Link 
            href="/settings"
            onClick={onClose}
            className="w-full flex justify-center py-2.5 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Upgrade Quota
          </Link>
          <button 
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
