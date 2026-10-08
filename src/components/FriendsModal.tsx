import React, { useState, useEffect } from 'react';
import { FriendItem, PendingFriendRequest } from '../types/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Users, Search, UserCheck, UserX, UserPlus, Check, Clock } from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingFriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingFriendRequest[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchFriendData = async () => {
    try {
      const res = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safepicks_token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
        setPendingReceived(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
      }
    } catch {
      // offline
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchFriendData();
    }
  }, [isOpen, user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('safepicks_token')}` },
      });
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('Friend request sent!');
        fetchFriendData();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        alert(data.error || 'Failed to send friend request');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        fetchFriendData();
        refreshMe();
      }
    } catch {
      // ignore
    }
  };

  const handleDecline = async (friendshipId: string) => {
    try {
      const res = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        fetchFriendData();
      }
    } catch {
      // ignore
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      const res = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        fetchFriendData();
        refreshMe();
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Arena Friends & Connections
              </h3>
              <p className="text-xs text-zinc-400">
                Network with real sports predictors worldwide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="mt-4 flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'friends' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition relative ${
              activeTab === 'requests' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Requests ({pendingReceived.length})
            {pendingReceived.length > 0 && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'search' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Find Users
          </button>
        </div>

        {actionSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs text-emerald-400">
            <Check className="h-4 w-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                You have not added any friends yet. Use "Find Users" tab to connect with real predictors!
              </div>
            ) : (
              friends.map((item) => (
                <div
                  key={item.friendshipId}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-black font-bold text-xs">
                      {item.user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{item.user.username}</span>
                        {item.user.role === 'admin' && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Friends since {new Date(item.since).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.friendshipId)}
                    className="rounded p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition"
                    title="Remove Friend"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PENDING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="mt-4 max-h-72 overflow-y-auto space-y-3">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Received ({pendingReceived.length})</h4>
              {pendingReceived.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No incoming friend requests.</p>
              ) : (
                pendingReceived.map((req) => (
                  <div
                    key={req.friendshipId}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{req.requester?.username}</p>
                      <p className="text-[11px] text-zinc-500">{req.requester?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(req.friendshipId)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.friendshipId)}
                        className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sent requests */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold uppercase text-zinc-400">Sent Requests ({pendingSent.length})</h4>
              {pendingSent.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No outgoing pending requests.</p>
              ) : (
                pendingSent.map((req) => (
                  <div
                    key={req.friendshipId}
                    className="flex items-center justify-between rounded-lg bg-zinc-950/40 p-2 text-xs text-zinc-400"
                  >
                    <span>Sent to <strong className="text-white">{req.recipient?.username}</strong></span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SEARCH USERS */}
        {activeTab === 'search' && (
          <div className="mt-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((usr) => (
                <div
                  key={usr.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/80 p-3"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{usr.username}</span>
                      {usr.role === 'admin' && (
                        <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">{usr.email}</p>
                  </div>

                  <button
                    onClick={() => handleSendRequest(usr.id)}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-emerald-500 hover:text-black transition"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
