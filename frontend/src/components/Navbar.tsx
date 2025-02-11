"use client"
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { checkAuth, logout } from "@/redux/authSlice";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../../public/images/logo.svg";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { logoutUser } from "../lib/auth";
import toast from "react-hot-toast";


export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await logoutUser(); 
      dispatch(logout()); 
      router.push("/login"); 
      toast.success("logout successfully")
      setIsDropdownOpen(false); 
    } catch (error) {
      toast.error("Something went wrong")
    }
  };
  const handleProfileClick = () => {
    setIsDropdownOpen(false);  
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <FaUserCircle className="text-2xl" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                    <Link
                      href="/profile"
                      onClick={handleProfileClick}  
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
              <Link href="/register" className="hover:text-gray-200 transition">
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
              <Link href="/profile/" className="block py-2 px-4 hover:bg-blue-800">
                My profile
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
