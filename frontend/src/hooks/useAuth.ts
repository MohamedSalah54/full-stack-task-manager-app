import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../lib/auth';

const useAuth = () => {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:3001/auth/me', {
          method: 'GET',
          credentials: 'include', // تأكد من إرسال الكوكيز مع الطلب
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // إذا لم يكن التوكن صالحاً أو مفقوداً، نسجل الخروج
          await logoutUser();
          setIsAuthenticated(false);
        }
      } catch (error) {
        await logoutUser();
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthChecked, isAuthenticated };
};

export default useAuth;
