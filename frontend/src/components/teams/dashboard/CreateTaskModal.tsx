"user client"
import { Dialog } from "@headlessui/react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { getTeamMembers } from "@/lib/teams";
import { createTask } from "@/lib/tasks";
import toast from "react-hot-toast";
import { useAppSelector } from "@/hooks/redux";

interface Props {
    onClose: () => void;
    teamId: string;
    onTaskCreated: () => void;
}

export default function CreateTaskModal({ onClose, onTaskCreated, teamId }: Props) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        assignedTo: "",
        category: "Work"
    });

    const [members, setMembers] = useState<any[]>([]);

    const creatorId = useAppSelector((state) => {
        return state.user?.id;
    });



    useEffect(() => {
        getTeamMembers()
            .then((data) => {
                setMembers(data);
                console.log("Fetched team members:", data);
            })
            .catch((error) => {
                console.error("Error fetching members:", error);
                toast.error("Failed to fetch members");
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data before submit:", formData);
        try {
          const taskData = {
            ...formData,
            teamId,
          };
      
          const response = await createTask(taskData, creatorId);
          toast.success("Task created successfully!");
          onClose();
          onTaskCreated();
        } catch (err) {
          toast.error("Failed to create task.");
        }
      };
      

    return (
        <Dialog open={true} onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
                    <Dialog.Title className="text-lg font-bold mb-4">Create Task</Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title Field */}
                        <input
                            type="text"
                            name="title"
                            onChange={handleChange}
                            placeholder="Title"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Description Field */}
                        <input
                            type="text"
                            name="description"
                            onChange={handleChange}
                            placeholder="Description"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Due Date Field */}
                        <input
                            type="date"
                            name="dueDate"
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Custom Select for AssignedTo */}
                        <Listbox
                            value={formData.assignedTo}
                            onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                        >
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                                    <span className="block truncate">
                                        {members.find((m) => m._id === formData.assignedTo)?.name || "Assign to"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {members.map((member) => (
                                        <Listbox.Option
                                            key={member._id}
                                            value={member._id}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                        {member.name}
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                        {/* Category Select */}
                        {/* Category Select */}
                        <Listbox
                            value={formData.category}
                            onChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                                    <span className="block truncate">
                                        {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {["work", "personal", "shopping"].map((option) => (
                                        <Listbox.Option
                                            key={option}
                                            value={option}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>



                        {/* Buttons */}
                        <div className="flex justify-between mt-4">

                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Create
                            </button>

                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
