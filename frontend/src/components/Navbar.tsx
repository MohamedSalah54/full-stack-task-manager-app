'use client';

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { checkAuth, logout } from "@/redux/authSlice";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../../public/images/logo.svg";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { logoutUser } from "../lib/auth";
import toast from "react-hot-toast";
import { useAppSelector } from "@/hooks/redux";
import { fetchProfile } from "@/redux/profileSlice";
import Loader from "@/loader/Loader";

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile } = useAppSelector((state) => state.profile);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const userId = useAppSelector((state: RootState) => state.auth.user?.id);
  const role = useAppSelector((state: RootState) => state.auth.user?.role);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        await dispatch(checkAuth());  // التأكد من المصادقة
        if (userId) {
          await dispatch(fetchProfile(userId));  // تحميل بيانات المستخدم
        }
      } catch (error) {
      } finally {
        setIsAuthChecked(true);
        setIsRoleLoaded(true);  // البيانات تم تحميلها
      }
    }
    
    loadData();
  }, [dispatch, userId]);  // يعتمد على `userId` فقط

  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchProfile(userId));
    }
  }, [dispatch, isAuthenticated, userId]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      router.push("/login");
      toast.success("Logout successfully");
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!isAuthChecked || !isRoleLoaded) return <div className="text-center py-4 text-white bg-blue-600"><Loader /></div>;
  

  const baseUrl = "http://localhost:3001";
  const imageUrl = profile?.profileImage
    ? profile.profileImage.startsWith("http")
      ? profile.profileImage.replace(/\\/g, "/")
      : `${baseUrl}/static/${profile.profileImage}`.replace(/\\/g, "/") 
    : "";
  

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSeeTeam = role && (role === 'user' || role === 'team-lead');
 
  
  

  
  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Image src={Logo} alt="Logo" width={60} height={40} />
          <span className="ml-2">Taskify</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/tasks" className="hover:text-gray-200 transition">
                Tasks
              </Link>

              {canSeeTeam && (
                <Link href="/teams" className="hover:text-gray-200 transition">
                  Team
                </Link>
              )}

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {profile && profile.profileImage && isValidUrl(imageUrl) ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      <Image
                        src={imageUrl}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <FaUserCircle className="text-2xl" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-200"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-gray-200 transition">
                Feature
              </Link>
              <Link href="/login" className="hover:text-gray-200 transition">
                Get Started
              </Link>
              <Link href="/login" className="hover:text-gray-200 transition">
                Login
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden focus:outline-none"
        >
          <FaBars className="text-2xl" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700">
          {isAuthenticated ? (
            <>
              <Link href="/tasks" className="block py-2 px-4 hover:bg-blue-800">
                Tasks
              </Link>

              {canSeeTeam && (
                <Link href="/team" className="block py-2 px-4 hover:bg-blue-800">
                  Team
                </Link>
              )}

              <Link href="/profile" className="block py-2 px-4 hover:bg-blue-800">
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 text-red-400 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="block py-2 px-4 hover:bg-blue-800">
                Feature
              </Link>
              <Link href="/register" className="block py-2 px-4 hover:bg-blue-800">
                Get Started
              </Link>
              <Link href="/login" className="block py-2 px-4 hover:bg-blue-800">
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
