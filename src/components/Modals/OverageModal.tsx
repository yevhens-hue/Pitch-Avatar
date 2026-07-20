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
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative">
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Active Seats Limit Reached</h2>
          <p className="text-sm text-gray-600 m-0">
            You have reached your limit of active Enrollment Seats. 
            To send new assignments, you need to either purchase additional seats or archive/delete older active enrollments.
          </p>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col gap-3">
          <Link 
            href="/settings"
            onClick={onClose}
            className="w-full flex justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Upgrade Quota
          </Link>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-md font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
