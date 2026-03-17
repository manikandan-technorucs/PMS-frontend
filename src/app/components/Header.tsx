import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, Sun, Moon, X, FolderKanban, CheckSquare, AlertCircle, Clock, ArrowRight, Menu } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { Logo } from '@/shared/components/ui/Logo';

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
    case 'project': return '#059669';
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
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.length > 0
    ? searchableItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b z-50 transition-all duration-300 header-base backdrop-blur-md bg-opacity-80">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
          <button
            className="md:hidden header-icon-btn p-1 flex items-center justify-center"
            onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div 
            onClick={() => navigate('/')} 
            className="flex items-center cursor-pointer"
          >
            <Logo className="h-7 sm:h-8 md:h-[40px] transition-transform hover:scale-[1.02]" showText={true} />
          </div>
        </div>

        {/* Center: Search Bar - Centered relative to the container */}
        <div className="flex-1 max-w-[600px] hidden md:flex justify-center" ref={searchRef}>
          <div className="relative w-full max-w-[480px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Search projects, tasks, issues... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="w-full h-10 pl-10 pr-10 rounded-[10px] border text-[14px] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all header-search shadow-sm"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearch && searchQuery.length > 0 && (
              <div className="absolute top-12 left-0 right-0 rounded-[12px] overflow-hidden z-50 border header-dropdown animate-fade-in shadow-xl glass-effect">
                {filteredResults.length === 0 ? (
                  <div className="p-8 text-center bg-theme-surface">
                    <div className="w-12 h-12 bg-theme-muted/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-theme-muted" />
                    </div>
                    <p className="text-[14px] text-theme-secondary">No results found for "<strong>{searchQuery}</strong>"</p>
                    <p className="text-[12px] text-theme-muted mt-1">Try another keyword</p>
                  </div>
                ) : (
                  <div className="bg-theme-surface">
                    <div className="px-4 py-3 border-b header-dropdown-bar flex justify-between items-center bg-theme-muted/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">{filteredResults.length} results</span>
                      <span className="text-[10px] text-theme-muted">Press Enter to view all</span>
                    </div>
                    {filteredResults.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { navigate(item.path); setSearchQuery(''); setShowSearch(false); }}
                        className="w-full flex items-center gap-4 px-4 py-3.5 transition-colors text-left border-b last:border-0 search-result-border hover:bg-theme-muted/5 group"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${getTypeColor(item.type)}15`, color: getTypeColor(item.type) }}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate text-theme-primary">{item.title}</p>
                          <p className="text-[11px] text-theme-muted uppercase tracking-tight">{item.type} · {item.id}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-theme-muted opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                      </button>
                    ))}
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
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-[#047857] to-[#34D399] rounded-full flex items-center justify-center shadow-sm">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[13px] font-semibold block leading-tight text-theme-primary">Admin User</span>
              <span className="text-[10px] block leading-tight text-theme-muted">Administrator</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
