import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] z-50">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[#059669] rounded-[6px] flex items-center justify-center">
              <span className="text-white font-semibold text-[14px]">T</span>
            </div>
            <h1 className="text-[20px] font-semibold text-[#1F2937]">TechnoRUCS PMS</h1>
          </div>

          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search projects, tasks, issues..."
              className="w-full h-10 pl-10 pr-4 rounded-[6px] border border-[#E5E7EB] bg-[#F8FAF9] text-[14px] 
                placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-[#ECFDF5] rounded-[6px] transition-colors relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-[#6B7280]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full"></span>
          </button>
          <button
            className="p-2 hover:bg-[#ECFDF5] rounded-[6px] transition-colors"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5 text-[#6B7280]" />
          </button>
          <button className="flex items-center gap-2 p-2 hover:bg-[#ECFDF5] rounded-[6px] transition-colors">
            <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-[14px] font-medium text-[#1F2937]">Admin User</span>
          </button>
        </div>
      </div>
    </header>
  );
}
