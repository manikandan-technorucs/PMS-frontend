import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, Sun, Moon, X, FolderKanban, CheckSquare, AlertCircle, Clock, Menu, User, ArrowRight, LogOut } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { useAuth } from '@/auth/AuthProvider';
import { api } from '@/api/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { Logo } from '@/components/ui/Logo';

// Mock search data
const searchableItems = [
  { type: 'project', id: 'PRJ-001', title: 'Enterprise Portal Redesign', path: '/projects/PRJ-001' },
  { type: 'project', id: 'PRJ-002', title: 'Mobile App Development', path: '/projects/PRJ-002' },
  { type: 'project', id: 'PRJ-003', title: 'API Integration Platform', path: '/projects/PRJ-003' },
  { type: 'project', id: 'PRJ-004', title: 'Cloud Migration Project', path: '/projects/PRJ-004' },
  { type: 'task', id: 'TSK-001', title: 'Design homepage mockup', path: '/tasks/TSK-001' },
  { type: 'task', id: 'TSK-002', title: 'Implement authentication API', path: '/tasks/TSK-002' },
  { type: 'task', id: 'TSK-003', title: 'Database schema optimization', path: '/tasks/TSK-003' },
  { type: 'task', id: 'TSK-005', title: 'Create data visualization components', path: '/tasks/TSK-005' },
  { type: 'issue', id: 'ISS-001', title: 'Login authentication fails on mobile', path: '/issues/ISS-001' },
  { type: 'issue', id: 'ISS-002', title: 'Dashboard loading performance issue', path: '/issues/ISS-002' },
  { type: 'issue', id: 'ISS-006', title: 'Security vulnerability in file upload', path: '/issues/ISS-006' },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'project': return <FolderKanban className="w-4 h-4" />;
    case 'task': return <CheckSquare className="w-4 h-4" />;
    case 'issue': return <AlertCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'project': return '#14b8a6';
    case 'task': return '#0284C7';
    case 'issue': return '#DC2626';
    default: return '#6B7280';
  }
}

export function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Derive display info from AuthContext user
  const displayName = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';
  const roleName = user?.role?.name || 'Member';
  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || 'U';

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get('/search/', { params: { q: debouncedQuery } });
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b z-50 transition-colors duration-300 header-base">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Hamburger + Logo + Search */}
        <div className="flex items-center gap-3 md:gap-6 flex-1">
          <button
            className="md:hidden header-icon-btn p-1"
            onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div 
            onClick={() => navigate('/')} 
            className="flex items-center min-w-0 md:w-[200px] lg:w-[240px] flex-shrink-0 cursor-pointer"
          >
            <Logo className="h-8 sm:h-10 md:h-[42px] transition-transform hover:scale-[1.02]" showText={true} />
          </div>

          {/* Search Bar - Hidden on very small screens, scales up smoothly */}
          <div className="relative hidden w-[200px] lg:w-[420px] md:block flex-shrink-0" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Search projects, tasks, issues... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="w-full h-10 pl-10 pr-10 rounded-lg border text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all header-search"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearch && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-[12px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100] max-h-[400px] overflow-y-auto" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                {isLoading ? (
                  <div className="p-4 text-center text-[#6B7280]">
                    <div className="animate-spin w-5 h-5 border-2 border-[#14b8a6] border-t-transparent rounded-full mx-auto mb-2"></div>
                    <span className="text-[13px]">Searching...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Results ({results.length})</div>
                    {results.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleResultClick(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F3F4F6] transition-colors text-left group"
                      >
                        <div
                          className="w-8 h-8 rounded-[6px] flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${getTypeColor(item.type)}15`, color: getTypeColor(item.type) }}
                        >
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-slate-700 truncate">{item.title}</p>
                          <p className="text-[12px] text-[#6B7280] flex items-center gap-2">
                            <span className="font-mono text-[11px] uppercase tracking-wider">{item.id}</span>
                            <span>•</span>
                            <span className="capitalize">{item.type}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#6B7280]">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-[14px]">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-icon-btn !p-1.5 sm:!p-2.5"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Notifications — navigates to notification inbox */}
          <button
            className="header-icon-btn relative !p-1.5 sm:!p-2.5"
            onClick={() => navigate('/notifications')}
            title="View Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-[#DC2626] rounded-full flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold px-1 shadow-sm">
              3
            </span>
          </button>

          {/* Settings — navigates to settings page */}
          <button
            className="hidden sm:block header-icon-btn !p-1.5 sm:!p-2.5"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 md:h-8 mx-1 md:mx-2 header-divider" />

          {/* User — dropdown with profile/logout */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-2 md:gap-2.5 py-1 md:py-1.5 px-0.5 md:px-2.5 rounded-[8px] transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover-neutral)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm text-white text-[11px] sm:text-[12px] font-bold" style={{ background: 'var(--brand-gradient)' }}>
                {initials}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-[13px] font-semibold block leading-tight text-theme-primary">{displayName}</span>
                <span className="text-[10px] block leading-tight text-theme-muted">{roleName}</span>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl z-[100] overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--brand-gradient)' }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-theme-primary truncate">{displayName}</p>
                      <p className="text-[12px] text-theme-muted truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-theme-secondary font-medium hover:bg-brand-teal-50 dark:hover:bg-slate-800 transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-theme-secondary font-medium hover:bg-brand-teal-50 dark:hover:bg-slate-800 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                </div>
                <div className="border-t py-1" style={{ borderColor: 'var(--border-color)' }}>
                  <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header >
  );
}
