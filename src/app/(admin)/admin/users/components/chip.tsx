'use client';

interface ChipProps {
  label: string;
  close?: () => Promise<void>;
}

export default function Chip({ label, close }: ChipProps) {
  return (
    <div className="p-2 bg-gray-200 rounded-full inline-flex items-center space-x-2 mr-2 mb-2">
      <span>{label}</span>
      <button type="button" className="text-gray-500 hover:text-gray-700" onClick={close}>
        &times;
      </button>
    </div>
  );
}
