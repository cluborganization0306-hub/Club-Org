import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-[#e0c3fc] via-[#f5ebff] to-[#d6e5fa] flex overflow-hidden relative">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <main className="flex-1 bg-transparent md:m-4 rounded-3xl overflow-y-scroll p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
