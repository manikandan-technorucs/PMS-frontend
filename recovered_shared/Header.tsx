import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, Sun, Moon, X, FolderKanban, CheckSquare, AlertCircle, Clock, Menu, User, ArrowRight } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { api } from '@/shared/lib/api';
import { useDebounce } from '@/shared/hooks/useDebounce';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

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
        <div className="flex items-center gap-3 md:gap-6">
          <button
            className="md:hidden header-icon-btn p-1"
            onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-[10px] items-center justify-center shadow-sm" style={{ background: 'var(--brand-gradient)' }}>
              <span className="text-white font-bold text-[14px] md:text-[15px]">T</span>
            </div>
            <h1 className="text-[16px] md:text-[18px] font-bold text-theme-primary hidden sm:block">TechnoRUCS PMS</h1>
          </div>

          {/* Search Bar - Hidden on very small screens, scales up smoothly */}
          <div className="relative hidden w-[200px] lg:w-[420px] md:block" ref={searchRef}>
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-[12px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100] max-h-[400px] overflow-y-auto">
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

          {/* User — navigates to profile page */}
          <button
            className="flex items-center gap-2 md:gap-2.5 py-1 md:py-1.5 px-0.5 md:px-2.5 rounded-[8px] transition-colors"
            onClick={() => navigate('/profile')}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover-neutral)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--brand-gradient)' }}>
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[13px] font-semibold block leading-tight text-theme-primary">Admin User</span>
              <span className="text-[10px] block leading-tight text-theme-muted">Administrator</span>
            </div>
          </button>
        </div>
      </div>
    </header >
  );
}
