// components/teams/DeleteTeamModal.tsx
import React from "react";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteTeamModal = ({ onClose, onConfirm }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Are you sure?</h2>
        <p className="text-gray-600 mb-6">Do you really want to delete your team? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamModal;
