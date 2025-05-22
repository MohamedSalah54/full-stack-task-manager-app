'use client';

import { Profile, UpdateProfileDto } from '@/interfaces/profile';
import { useState, ChangeEvent } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { BiObjectsHorizontalLeft } from "react-icons/bi";
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkIcon from '@mui/icons-material/Work';

interface Props {
  profile: Profile | null;
  role?: string;
  onCancel: () => void;
  onSave: (data: UpdateProfileDto & { profileImageFile?: File }) => void;
}


export default function ProfileForm({ profile, role, onCancel, onSave }: Props) {
  const [form, setForm] = useState<UpdateProfileDto>({
    name: profile?.name,
    email: profile?.email,
    role: profile?.role,
    bio: profile?.bio,
    position: profile?.position,
    team: profile?.team,
    teamLead: profile?.teamLead,
  });
  const [profileImageFile, setProfileImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>(profile?.profileImage || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const res: any = await onSave({ ...form, profileImageFile });
  
    if (res?.newImageUrl) {
      setImagePreview(res.newImageUrl); 
      setForm(prev => ({ ...prev, profileImageUrl: res.newImageUrl }));
    }
  };
  
  
  
  

  const isAdmin = role === 'admin';
  const disabledInputStyle = "bg-gray-100 cursor-not-allowed text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      {/* Name */}
      <div className="flex items-center gap-3">
        <PersonOutlineIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            type="text"
            value={form.name || ''}
            onChange={handleChange}
            disabled={!isAdmin}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md ${!isAdmin ? disabledInputStyle : ''}`}
          />
        </div>
      </div>
    
      {/* Email */}
      <div className="flex items-center gap-3">
        <EmailIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            disabled={!isAdmin}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md ${!isAdmin ? disabledInputStyle : ''}`}
          />
        </div>
      </div>
    
      {/* Role */}
      <div className="flex items-center gap-3">
        <AdminPanelSettingsIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            name="role"
            type="text"
            value={form.role || ''}
            onChange={handleChange}
            disabled={!isAdmin}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md ${!isAdmin ? disabledInputStyle : ''}`}
          />
        </div>
      </div>
    
      {/* Bio */}
      <div className="flex items-center gap-3">
        <BiObjectsHorizontalLeft className="text-blue-600 w-6 h-10" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio || ''}
            onChange={handleChange}
            placeholder="Your bio..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    
      {/* Position */}
      <div className="flex items-center gap-3">
        <WorkIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            name="position"
            value={form.position || ''}
            onChange={handleChange}
            placeholder="Your position"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    
      {/* Team */}
      <div className="flex items-center gap-3">
        <GroupIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <input
            name="team"
            value={form.team || ''}
            onChange={handleChange}
            placeholder="Your team"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    
      {/* Team Lead */}
      <div className="flex items-center gap-3">
        <PeopleAltIcon className="text-blue-600" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
          <input
            name="teamLead"
            value={form.teamLead || ''}
            onChange={handleChange}
            placeholder="Your team lead"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* رفع صورة البروفايل */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700">Upload Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {imagePreview && (
          <div>
            <p className="text-sm text-gray-600">Image Preview:</p>
            <img 
              src={imagePreview}
              alt="Profile Preview"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              className="mt-2 rounded"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
