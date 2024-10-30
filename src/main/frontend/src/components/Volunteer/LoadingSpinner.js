import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600">Loading Volunteers...</p>
    </div>
  );
};

export default LoadingSpinner;