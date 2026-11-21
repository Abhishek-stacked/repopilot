import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout = ({ withSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-gray-100">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {withSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
