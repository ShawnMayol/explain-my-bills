import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/5 min-w-[180px] border-r p-6 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <p className="font-bold text-sm">Explain My Bills!</p>
            <p className="text-xs text-gray-500">June 20, 2025</p>
          </div>
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              Hello, {user?.displayName || user?.email || 'User'}!
            </h2>
            <nav className="flex flex-col space-y-3">
              <a href="#" className="font-semibold hover:underline">Home</a>
              <a href="#" className="font-semibold hover:underline">Analytics</a>
              <a href="#" className="font-semibold hover:underline">Notifications</a>
              <a href="#" className="font-semibold hover:underline">Bills</a>
              <a href="#" className="font-semibold hover:underline">Profile</a>
            </nav>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm font-semibold underline text-left">
          Sign-out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 relative">
        <h1 className="text-3xl font-bold mb-8">Recent Summarized Bills</h1>

        {/* Grid of Bills */}
        <div className="grid grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 flex">
              <div className="w-24 h-24 bg-gray-200 rounded mr-4"></div>
              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-bold">Meralco Bill</p>
                  <p className="text-sm text-gray-600">Short description of the bill...</p>
                </div>
                <p className="text-sm mt-4">xx/xx/xxxx</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Button */}
        <button className="absolute bottom-10 right-10 px-6 py-3 border-2 font-semibold rounded-full hover:bg-gray-100">
          + Upload your Bill
        </button>
      </div>
    </div>
  );
}
