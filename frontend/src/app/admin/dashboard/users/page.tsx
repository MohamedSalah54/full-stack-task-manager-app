"use client"
import React, { useEffect, useState } from "react";
import CreateModal from "@/components/users/CreateModal";
import EditModal from "@/components/users/UpdateModal";
import DeleteModal from "@/components/users/DeleteModal";
import DataTable from "@/components/users/UsersList";
import { IoMdAdd } from "react-icons/io";
import { MdDelete, MdEdit } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { deleteUser, deleteManyUsers, updateUser, fetchAllUsers, fetchSearchUsers } from "@/lib/user";
import { toast } from "react-hot-toast";

const Users: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery) {
      const params = {
        name: searchQuery,
        email: searchQuery,
        role: searchQuery,
      };

      dispatch(fetchSearchUsers(params)); 
    } else {
      dispatch(fetchAllUsers()); 
    }
  }, [dispatch, searchQuery]);


  const { user: users } = useAppSelector((state) => state.createUser);

  const handleCreateModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const handleEditModal = () => {
    if (selectedUsers.length === 1) {
      const user = users.find((u: any) => u._id === selectedUsers[0]);
      setEditingUser(user);
      setIsEditOpen(true);
    } else {
      toast.error("Please select only one user to edit");
    }
  };

  const handleDelete = () => {
    if (selectedUsers.length === 0) return toast.error("Please select at least one user to delete");
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUsers.length === 1) {
      dispatch(deleteUser(selectedUsers[0]))
        .then(() => toast.success("User deleted successfully"))
        .catch(() => toast.error("Failed to delete user"));
    } else {
      dispatch(deleteManyUsers(selectedUsers))
        .then(() => toast.success("Users deleted successfully"))
        .catch(() => toast.error("Failed to delete users"));
    }
    setIsDeleteOpen(false);
  };

  const handleUpdateUser = (user: any) => {
    const { _id, name, email } = user;
    const userData = { name, email };

    dispatch(updateUser(_id, userData as any))
      .then(() => toast.success("User updated successfully"))
      .catch(() => toast.error("Failed to update user"));
    setIsEditOpen(false);
  };

  
  return (
    <>
      <div className="flex justify-end mt-4 mb-4 mr-4 space-x-4">
        <button
          type="button"
          onClick={handleCreateModal}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center space-x-2"
        >
          <IoMdAdd />
          <span>Create</span>
        </button>
        <CreateModal isOpen={isOpen} handleCloseModal={handleCloseModal} />

        <button
          type="button"
          onClick={handleEditModal}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center space-x-2"
        >
          <MdEdit />
          <span>Update</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center space-x-2"
        >
          <MdDelete />
          <span>Delete</span>
        </button>
      </div>

      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={editingUser}
        onUpdate={handleUpdateUser}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
      
      <div className="mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name, email, or role"
        className="px-4 py-2 border border-gray-300 rounded-md ml-5"
      />
      </div>

      <div>
        <DataTable onSelect={(ids) => setSelectedUsers(ids)} />
      </div>
    </>
  );
};

export default Users;
