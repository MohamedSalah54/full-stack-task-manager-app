"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const ClipLoader = dynamic(
  () => import('react-spinners/ClipLoader').then((mod) => mod.default),
  { ssr: false }
);

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader size={60} color="#3498db" />
    </div>
  );
};

export default Loader;
