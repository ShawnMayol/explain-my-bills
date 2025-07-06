import React from "react";

export const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-300"></div>
      <span>{message}</span>
    </div>
  );
};
