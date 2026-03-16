import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Clock,
  Timer,
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
  ChevronRight,
  Milestone
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, section: 'Main' },
  { path: '/projects', label: 'Projects', icon: <FolderKanban className="w-[18px] h-[18px]" /> },
  { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-[18px] h-[18px]" /> },
  { path: '/issues', label: 'Issues', icon: <AlertCircle className="w-[18px] h-[18px]" /> },
  { path: '/time-log', label: 'Time Logs', icon: <Clock className="w-[18px] h-[18px]" /> },
  { path: '/timesheets', label: 'Timesheets', icon: <Timer className="w-[18px] h-[18px]" /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 className="w-[18px] h-[18px]" /> },
  { path: '/milestones', label: 'Milestones', icon: <Milestone className="w-[18px] h-[18px]" /> },
  { path: '/users', label: 'Users', icon: <Users className="w-[18px] h-[18px]" />, section: 'Management' },
  { path: '/teams', label: 'Teams', icon: <UsersRound className="w-[18px] h-[18px]" /> },
  { path: '/roles', label: 'Roles', icon: <Shield className="w-[18px] h-[18px]" /> },
  { path: '/automation', label: 'Automation', icon: <Zap className="w-[18px] h-[18px]" />, section: 'System' },
  { path: '/email-templates', label: 'Email Templates', icon: <Mail className="w-[18px] h-[18px]" /> },
  { path: '/notification-settings', label: 'Notifications', icon: <BellRing className="w-[18px] h-[18px]" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-[18px] h-[18px]" /> },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync with CSS variable for PageLayout smooth sizing
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '68px' : '240px');
  }, [collapsed]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !collapsed) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Handle mobile menu toggle
  useEffect(() => {
    const toggleMenu = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', toggleMenu);
    return () => window.removeEventListener('toggle-mobile-menu', toggleMenu);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  let currentSection = '';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-16 bottom-0 border-r transition-transform duration-300 md:transition-all z-40 sidebar-base 
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              let sectionHeader = null;
              if (item.section && item.section !== currentSection) {
                currentSection = item.section;
                sectionHeader = !collapsed ? (
                  <div className="px-3 pt-5 pb-2 first:pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-theme-muted">{item.section}</span>
                  </div>
                ) : (
                  <div className="pt-4 pb-2 flex justify-center">
                    <div className="w-6 h-px sidebar-section-divider" />
                  </div>
                );
              }

              return (
                <React.Fragment key={item.path}>
                  {sectionHeader}
                  <Link
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg transition-all duration-200 mb-0.5 ${collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'
                      } ${isActive ? 'sidebar-link-active' : 'sidebar-link-default'}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="p-2 sidebar-footer">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] transition-all sidebar-collapse-btn"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[12px] font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
