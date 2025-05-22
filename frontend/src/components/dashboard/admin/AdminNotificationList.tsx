// 'use client';

// import { useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// import { fetchAllNotifications } from '@/redux/notificationSlice';

// const AdminNotificationList = () => {
//   const dispatch = useAppDispatch();

//   const notifications = useAppSelector((state) => state.notifications.notifications);
//   const loading = useAppSelector((state) => state.notifications.loading);
//   const error = useAppSelector((state) => state.notifications.error);

//   useEffect(() => {
//     if (notifications.length === 0) {  // تأكد من أن الإشعارات غير محملة
//       dispatch(fetchAllNotifications());
//     }
//   }, [dispatch, notifications.length]);  // يتم الجلب عند تغيير الحالة فقط

//   const latestNotifications = [...notifications]
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//     .slice(0, 5);

//   return (
//     <div className="flex flex-col relative top-[-200px] ml-10 overflow-hidden w-full md:w-1/2 h-auto">
//     <div className="text-xl font-semibold mb-2 ml-3">
//       Recent Notifications
//     </div>
  
//     {loading && <div>Loading notifications...</div>}
//     {error && <div className="text-red-500">{error}</div>}
//     {!loading && latestNotifications.length === 0 && (
//       <div>No notifications found.</div>
//     )}
  
//     <ul className="space-y-2">
//       {latestNotifications.map((notif) => (
//         <div key={notif._id}>
//           <li className="flex justify-between p-4">
//             <div>
//               <div className="font-semibold">{notif.message}</div>
//               <div className="text-sm text-gray-500">
//                 {new Date(notif.date).toLocaleString()}
//               </div>
//             </div>
//             <div className="border-b-[1px] w-max mt-2"></div>
//           </li>
//         </div>
//       ))}
//     </ul>
//   </div>
  
//   );
// };

// export default AdminNotificationList;
