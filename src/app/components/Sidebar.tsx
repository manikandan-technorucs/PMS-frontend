import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Clock,
  BarChart3,
  Users,
  UsersRound,
  Shield,
  KeyRound,
  Zap,
  Mail,
  BellRing,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
  { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
  { path: '/issues', label: 'Issues', icon: <AlertCircle className="w-5 h-5" /> },
  { path: '/time-log', label: 'Time Log', icon: <Clock className="w-5 h-5" /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { path: '/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { path: '/teams', label: 'Teams', icon: <UsersRound className="w-5 h-5" /> },
  { path: '/roles', label: 'Roles', icon: <Shield className="w-5 h-5" /> },
  { path: '/permissions', label: 'Permissions', icon: <KeyRound className="w-5 h-5" /> },
  { path: '/automation', label: 'Automation', icon: <Zap className="w-5 h-5" /> },
  { path: '/email-templates', label: 'Email Templates', icon: <Mail className="w-5 h-5" /> },
  { path: '/notifications', label: 'Notifications', icon: <BellRing className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-white border-r border-[#E5E7EB] transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-60'
      }`}>
      <div className="flex flex-col h-full">
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-[14px] transition-colors relative ${isActive
                    ? 'text-[#059669] bg-[#ECFDF5] border-l-4 border-[#059669]'
                    : 'text-[#6B7280] hover:bg-[#F8FAF9] hover:text-[#1F2937]'
                  }`}
              >
                <span className={isActive ? 'text-[#059669]' : 'text-[#6B7280]'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-[#E5E7EB] hover:bg-[#ECFDF5] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[#6B7280]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
          )}
        </button>
      </div>
    </aside>
  );
}
