import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '@/types';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export default function AccessModal({ isOpen, onClose, project }: AccessModalProps) {
  const [accessType, setAccessType] = useState('me');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-1"
        >
          <X size={20} />
        </button>

        <div className="p-8 pb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Access</h2>
          
          <div className="relative mt-2">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-800 font-medium z-10">
              Access type *
            </label>
            <div className="relative">
              <select 
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="block w-full px-4 py-3.5 text-base text-gray-900 bg-white border-2 border-blue-500 rounded-lg appearance-none focus:outline-none cursor-pointer shadow-sm relative z-0"
              >
                <option value="me">Available to me</option>
                <option value="company">Available to company users</option>
                <option value="individual">Available to individual users</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 z-10">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
