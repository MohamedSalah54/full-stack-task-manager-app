'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { login } from '@/redux/authSlice';
import { loginUser } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/tasks');
    } else {
      setIsLoading(false); 
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      dispatch(login({ token: data.token, user: data.user }));  

      toast.success('Login successful!');
      setTimeout(() => {
        router.push('/tasks');
      }, 2000);
    } catch (err: any) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/login.jpg')" }}></div>

      <div className="relative z-10 flex justify-center items-center min-h-screen bg-black bg-opacity-50">
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-4 py-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          {/* <div className="text-center text-sm text-gray-500 mt-10">
            Don't have an account?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-700">Sign Up</a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
