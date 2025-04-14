// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';

// export interface User {
//   _id: string;
//   name: string;
//   title: string;
//   email: string;
//   avatar: string;
//   bio: string;
//   linkedin: string;
// }

// export const useProfile = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     getProfileData()
//       .then((data) => {
//         const mappedUser: User = {
//           name: data.name || 'No Name',
//           title: data.title || 'No Title',
//           email: data.email,
//           avatar: data.linkedinPhoto || 'https://via.placeholder.com/150',
//           bio: data.linkedinBio || 'No bio available',
//           linkedin: data.linkedinUrl || '',
//         };
//         setUser(mappedUser);

//       })
//       .catch((error) => {
//         console.error("Error fetching profile:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   const updateProfile = async (formData: { name: string; bio: string; linkedin: string }): Promise<void> => {
//     try {
//       const updatedData = await updateProfileData(formData);
//       const updatedUser: User = {
//         name: updatedData.name || formData.name,
//         title: updatedData.title || user?.title || 'No Title',
//         email: updatedData.email,
//         avatar: updatedData.linkedinPhoto || user?.avatar || 'https://via.placeholder.com/150',
//         bio: updatedData.linkedinBio || formData.bio,
//         linkedin: updatedData.linkedinUrl || formData.linkedin,
//       };
//       setUser(updatedUser);
//       toast.success("Profile updated successfully!");

//     } catch (error) {
//         toast.error("Something went wrong, Please try again later");
//     }
//   };

//   return { user, loading, updateProfile };
// };
