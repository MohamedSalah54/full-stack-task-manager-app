// components/users/DeleteModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteModal: React.FC<Props> = ({ isOpen, onClose, onConfirmDelete }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" leave="ease-in duration-200"
          enterFrom="opacity-0" enterTo="opacity-100"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">Delete User</Dialog.Title>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteModal;
