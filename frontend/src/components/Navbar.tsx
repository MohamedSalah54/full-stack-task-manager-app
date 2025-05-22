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
import { fetchNotifications, markNotificationAsRead,fetchAllNotifications  } from '@/redux/notificationSlice';
import { Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import socket from "@/lib/socket";
import { Dialog } from '@mui/material';


export default function Navbar() {
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile } = useAppSelector((state) => state.profile);
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useAppSelector((state: RootState) => state.auth.user?.role);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const loading = useAppSelector((state) => state.notifications.loading);

  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationAnchorRef = useRef<HTMLButtonElement>(null);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasReloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("hasReloaded", "true");
      window.location.reload();
    }
  }, []);
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      dispatch(fetchAllNotifications()); 
    } else if (userId) {
      dispatch(fetchNotifications(userId));  
    }
  }, [dispatch, userId, currentUser]);
  
  useEffect(() => {
    if (userId) {
      socket.on('new_notification', (notification) => {
        dispatch(setNotifications([notification, ...notifications])); 
      });
  
      return () => {
        socket.off('new_notification'); 
      };
    }
  }, [userId, dispatch, notifications]);
  
  const handleToggleNotifications = () => {
    setOpenNotifications((prev) => !prev);
  };
  
  const handleNotificationClick = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };
  
  const handleClickOutside = (event: MouseEvent) => {
    if (
      notificationAnchorRef.current &&
      !notificationAnchorRef.current.contains(event.target as Node)
    ) {
      setOpenNotifications(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(checkAuth());
        if (userId) {
          await dispatch(fetchProfile(userId));
        }
      } catch (error) {
        console.log("Auth check failed", error);
      } finally {
        setIsAuthChecked(true);
        setIsRoleLoaded(true);
      }
    };
  
    loadData();
  }, [dispatch]);
  

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
              <Link href="/tasks" className="hover:text-gray-200 transition">Tasks</Link>

              {canSeeTeam && (
                <Link href="/teams" className="hover:text-gray-200 transition">Team</Link>
              )}

              {currentUser?.role?.toLowerCase() === 'team-lead' ? (
                <Link href="/dashboard" className="hover:text-gray-200 transition">
                  Dashboard
                </Link>
              ) : null}

              {currentUser?.role?.toLowerCase() === 'admin' ? (
                <Link href="/admin/dashboard" className="hover:text-gray-200 transition">
                  Dashboard
                </Link>
              ) : null}

              {currentUser?.role?.toLowerCase() === 'admin' ? (
                <Link href="/admin/users" className="hover:text-gray-200 transition">
                  Users
                </Link>
              ) : null}


              {/* Notifications */}
              <div className="relative">
                <button
                  ref={notificationAnchorRef}
                  onClick={handleToggleNotifications}
                  className="relative hover:text-gray-200 transition focus:outline-none p-1 min-w-0 text-white"
                >
                  <NotificationsIcon className="w-5 h-5" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>

                <Tooltip
                  open={openNotifications}
                  title={
                    <div className="max-h-72 overflow-y-auto p-3 bg-white text-black text-base">
                      {loading ? (
                        <div className="text-center text-gray-500 py-4">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 rounded ${notification.isRead ? 'text-gray-500' : 'font-semibold'
                              }`}
                          >
                            {notification.message}
                            <div className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  }
                  placement="bottom-start"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: 'white',
                        border: '2px solid #2563eb',
                        color: 'black',
                        boxShadow: 'none',
                        width: 350,
                        padding: 0,
                      },
                    },
                    arrow: {
                      sx: {
                        color: 'white',
                      },
                    },
                  }}
                />

              </div>

              {/* Profile */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {profile?.profileImage && isValidUrl(imageUrl) ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      <Image src={imageUrl} alt="Profile" width={40} height={40} className="object-cover" />
                    </div>
                  ) : (
                    <FaUserCircle className="text-2xl" />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-200">
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
              <Link href="/" className="hover:text-gray-200 transition">Feature</Link>
              <Link href="/login" className="hover:text-gray-200 transition">Get Started</Link>
              <Link href="/login" className="hover:text-gray-200 transition">Login</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden focus:outline-none">
          <FaBars className="text-2xl" />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700">
          {isAuthenticated ? (
            <>
              <Link href="/tasks" className="block py-2 px-4 hover:bg-blue-800">Tasks</Link>

              {canSeeTeam && (
                <Link href="/teams" className="block py-2 px-4 hover:bg-blue-800">Team</Link>
              )}
              {currentUser?.role === 'team-lead' && (
                <Link href="/dashboard" className="block py-2 px-4 hover:bg-blue-800">Dashboard</Link>
              )}

              {/* Notifications */}
              <Link
                href="#"
                onClick={() => setOpenDialog(true)}
                className="block py-2 px-4 text-white hover:bg-blue-800 w-full text-start"
              >
                Notifications
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full text-xs">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </Link>

              {/* Dialog in mobile */}
              <Dialog fullScreen open={openDialog} onClose={() => setOpenDialog(false)}>
                <div className="bg-white text-black h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h2 className="text-xl font-semibold">Notifications</h2>
                    <button
                      onClick={() => setOpenDialog(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    {loading ? (
                      <div className="text-center text-gray-500 py-4">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            handleNotificationClick(notification._id);
                            setOpenDialog(false);
                          }}
                          className={`p-3 cursor-pointer hover:bg-gray-100 rounded-md transition ${notification.isRead ? 'text-gray-500' : 'font-semibold'}`}
                        >
                          <div>{notification.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Dialog>

              <Link href="/profile" className="block py-2 px-4 hover:bg-blue-800">My Profile</Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 text-red-400 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="block py-2 px-4 hover:bg-blue-800">Feature</Link>
              <Link href="/register" className="block py-2 px-4 hover:bg-blue-800">Get Started</Link>
              <Link href="/login" className="block py-2 px-4 hover:bg-blue-800">Login</Link>
            </>
          )}
        </div>
      )}

    </nav>

  );
}
