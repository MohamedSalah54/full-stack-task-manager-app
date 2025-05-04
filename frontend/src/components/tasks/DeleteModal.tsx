'use client';
import React from 'react';
import { DeleteModalProps } from '@/interfaces/deleteModal';

const DeleteModal: React.FC<DeleteModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Are you sure you want to delete this task?
        </h2>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="text-gray-600">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
