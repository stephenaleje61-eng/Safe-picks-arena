import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Bell, Users, Shield, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'predictions' | 'live' | 'market' | 'chat';
  setActiveTab: (tab: 'predictions' | 'live' | 'market' | 'chat') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenFriends: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenArchitecture: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenFriends,
  onOpenNotifications,
  onOpenAdmin,
  onOpenArchitecture,
  unreadCount,
}) => {
  const { user, logout, toggleAdminRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/90 bg-[#06090F]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('predictions');
            }}
            className="flex items-center gap-2.5 text-lg font-black tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-extrabold text-black shadow-sm shadow-emerald-500/20">
              ⚡
            </span>
            <span className="font-heading text-xl font-extrabold tracking-wider">
              SAFE PICKS <span className="text-emerald-400">ARENA</span>
            </span>
          </a>
          <span className="hidden rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 md:inline-block border border-emerald-500/20">
            100% FREE
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single row, clean typography) */}
        <nav className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap rounded-md ${
              activeTab === 'predictions'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Admin Safe Picks
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap rounded-md ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Live Matches
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap rounded-md ${
              activeTab === 'market'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            Bookmaker Hub
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap rounded-md ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            World Chat
          </button>
          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors whitespace-nowrap"
            title="Enterprise 5M+ Scalability Architecture Specification"
          >
            Architecture
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User State */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {/* Notifications Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black ring-2 ring-[#06090F]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Friends Drawer Button */}
              <button
                onClick={onOpenFriends}
                className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Friends System"
              >
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">Friends</span>
                {user.friendsCount !== undefined && user.friendsCount > 0 && (
                  <span className="tabular-nums font-mono text-[11px] text-zinc-400">
                    ({user.friendsCount})
                  </span>
                )}
              </button>

              {/* Admin Dashboard Action */}
              {user.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin Desk</span>
                </button>
              )}

              {/* Profile Avatar / Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-left transition hover:border-zinc-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 font-bold text-black text-xs">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-xs font-medium text-zinc-200 sm:inline">
                    {user.username}
                  </span>
                  {user.isVerified ? (
                    <span title="Verified Account">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                  ) : (
                    <span title="Email Not Verified">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-[#0B0F17] p-2 shadow-2xl shadow-black"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="border-b border-zinc-800/80 px-3 py-2 text-xs">
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="truncate text-zinc-400">{user.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">
                          {user.role}
                        </span>
                        <span>·</span>
                        <span className={user.isVerified ? 'text-emerald-400 text-[10px]' : 'text-amber-400 text-[10px]'}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          toggleAdminRole();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        Switch Role ({user.role === 'admin' ? 'Set as User' : 'Set as Admin'})
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:bg-emerald-400 shadow-sm shadow-emerald-500/20 whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile sub-bar tabs */}
      <div className="flex overflow-x-auto border-t border-zinc-900 bg-black/60 px-2 py-1 md:hidden">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'predictions' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'
          }`}
        >
          Admin Picks
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'live' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'
          }`}
        >
          Live Matches
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'market' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'
          }`}
        >
          Bookmakers
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${
            activeTab === 'chat' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'
          }`}
        >
          World Chat
        </button>
      </div>
    </header>
  );
};
