"use client";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white py-4 ">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Taskify. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
