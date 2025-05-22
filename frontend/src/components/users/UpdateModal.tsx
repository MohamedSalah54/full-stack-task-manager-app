'use client';

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (user: any) => void;
}

const EditModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = () => {
    if (user && user._id) {
      console.log("formData before update:", formData);
      onUpdate({ _id: user._id, ...formData });

      onClose();
    }
  };


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 overflow-hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" leave="ease-in duration-200"
          enterFrom="opacity-0" enterTo="opacity-100"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center z-50">
          <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">Edit User</Dialog.Title>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full mb-3 px-4 py-2 border rounded-md"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full mb-3 px-4 py-2 border rounded-md"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mb-3 px-4 py-2 border rounded-md"
            >
              <option value="" disabled>-- Select Role --</option>
              <option value="user">User</option>
              <option value="team-lead">Team Lead</option>
              <option value="admin">Admin</option>
            </select>



            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditModal;
