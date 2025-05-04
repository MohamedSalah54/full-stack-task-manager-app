"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white-100 flex flex-col justify-between m-0 ">
      <section className="h-screen flex flex-col sm:flex-row items-center justify-center text-center sm:text-left px-6 mt-0 pt-0 gap-x-2">
        <div className="sm:w-1/2 flex flex-col items-center sm:items-start ml-10" >
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 ">
            Organize your
          </h1>
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 ">
            work and
          </h1>
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 ">
            life, finally.
          </h1>

          <p className="text-lg sm:text-xl mb-6">
            Manage your tasks efficiently and stay organized.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-lg"
          >
            Get Started
          </Link>
        </div>

        <div className="sm:w-1/2 flex justify-center">
          <img
            src="/images/hero-image.jpg"
            alt="Taskify"
            className="w-[700px] h-auto object-cover drop-shadow-[0_0_60px_rgba(255,255,255,0.3)]"
          />
        </div>
      </section>
      <section className="py-24 mt-16 bg-cover bg-center relative" style={{ backgroundImage: 'url(/images/feature.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-semibold text-white mb-12">
            The Perfect Solution for Organizing Your Tasks Effectively
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <img src="/images/tasks.png" alt="Organize Tasks" className="w-full h-32 object-contain rounded-t-lg mb-4" />
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Organize Tasks</h3>
              <p className="text-gray-700">
                Create and manage your tasks in a simple and organized way.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <img src="/images/time.png" alt="Set Deadlines" className="w-full h-32 object-contain rounded-t-lg mb-4" />
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Set Deadlines</h3>
              <p className="text-gray-700">
                Set deadlines for your tasks and never miss a due date again.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <img src="/images/coloborators.png" alt="Collaborate" className="w-full h-32 object-contain rounded-t-lg mb-4" />
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">Collaborate</h3>
              <p className="text-gray-700">
                Share tasks with others and collaborate effectively on projects.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
