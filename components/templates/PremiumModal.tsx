"use client";

import React from "react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
        {/* Close button (optional, disabled for locked state) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Premium Feature
        </h2>

        <p className="text-gray-700 leading-relaxed mb-6">
          This template is part of the Premium collection. Unlock all premium
          templates, advanced features, and unlimited PDF downloads.
        </p>

        <div className="flex flex-col space-y-3">
          <button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            Upgrade Now
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
