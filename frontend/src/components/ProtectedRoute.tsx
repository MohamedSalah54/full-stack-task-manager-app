'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux'; 
import { RootState } from '@/redux/store';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const router = useRouter();
  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
