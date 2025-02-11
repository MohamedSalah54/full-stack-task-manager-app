import Link from "next/link";
import { FC } from "react";

const NotFound: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-6xl font-extrabold text-gray-800">404</h1>
      <h2 className="mt-2 text-2xl font-semibold text-gray-700">
        Page Not Found!
      </h2>
      <p className="mt-2 text-gray-500 text-center">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
