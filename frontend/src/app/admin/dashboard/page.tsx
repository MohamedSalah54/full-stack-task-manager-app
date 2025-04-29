"use client"
import AdminTeamsOverview from '@/components/dashboard/admin/AdminTeamsOverview'
import AdminTasksOverview from '@/components/dashboard/admin/AdminTasksOverview'
import { Typography } from '@mui/material'
import { useAppSelector } from '@/hooks/redux'
import { RootState } from '@/redux/store'
import ProtectedRoute from '@/components/ProtectedRoute'


const page = () => {
  const currentUser = useAppSelector((state: RootState) => state.auth.user);


  return (
    <ProtectedRoute>
      <div className=''>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom mt={5}>
          Welcome back, {currentUser?.name} ! 🎉
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" textAlign="center" mb={3}>
          Here's an overview of all teams, users, and tasks performance
        </Typography>
        <AdminTasksOverview />
        <AdminTeamsOverview />
      </div>
    </ProtectedRoute>


  )
}

export default page
