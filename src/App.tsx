import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AdminPredictionsHero } from './components/AdminPredictionsHero.tsx';
import { LiveMatchesSection } from './components/LiveMatchesSection.tsx';
import { MarketHub } from './components/MarketHub.tsx';
import { WorldChat } from './components/WorldChat.tsx';
import { PredictionAnalysisModal } from './components/PredictionAnalysisModal.tsx';
import { FriendsModal } from './components/FriendsModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AdminDashboardModal } from './components/AdminDashboardModal.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { NotificationsPopover } from './components/NotificationsPopover.tsx';
import { OfficialPrediction, LiveMatch, MatchPredictionAnalysis, NotificationItem } from './types/client.ts';
import { ShieldCheck, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

function ArenaApp() {
  const { user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'predictions' | 'live' | 'market' | 'chat'>('predictions');

  // Modals & Panels State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState<OfficialPrediction | null>(null);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);

  // Analysis Lab Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<MatchPredictionAnalysis | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);

  // Data States
  const [predictions, setPredictions] = useState<OfficialPrediction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // 1. Fetch Official Predictions
  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/predictions');
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch {
      // offline
    }
  };

  // 2. Fetch User Notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safepicks_token')}` },
      });
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchPredictions();
    fetchNotifications();

    // Poll predictions & notifications every 30s
    const interval = setInterval(() => {
      fetchPredictions();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Admin Prediction Handlers
  const handleSavePrediction = async (predData: Partial<OfficialPrediction>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('safepicks_token');
      const isEditing = Boolean(predData.id);
      const url = isEditing ? `/api/predictions/${predData.id}` : '/api/predictions';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(predData),
      });

      if (res.ok) {
        await fetchPredictions();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeletePrediction = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('safepicks_token');
      const res = await fetch(`/api/predictions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchPredictions();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateStatus = async (id: string, status: OfficialPrediction['status']) => {
    try {
      const token = localStorage.getItem('safepicks_token');
      const res = await fetch(`/api/predictions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchPredictions();
      }
    } catch {
      // ignore
    }
  };

  // Analysis triggers
  const handleSelectPredictionForAnalysis = (pred: OfficialPrediction) => {
    const analysis: MatchPredictionAnalysis = {
      matchId: pred.id,
      homeTeam: pred.homeTeam,
      awayTeam: pred.awayTeam,
      league: pred.league,
      homeWinProb: pred.confidencePercent,
      drawProb: 15,
      awayWinProb: Math.max(5, 100 - pred.confidencePercent - 15),
      predictedScore: '2 - 1',
      recommendedPick: pred.pick,
      confidenceScore: pred.confidencePercent,
      keyFactors: pred.factors,
      homeRecentForm: ['W', 'W', 'D', 'W', 'W'],
      awayRecentForm: ['L', 'D', 'W', 'L', 'D'],
      headToHeadHistory: [
        { date: 'Last Match', result: `${pred.homeTeam} Won`, score: '2 - 1' },
        { date: 'Previous Leg', result: 'Draw', score: '1 - 1' },
      ],
      avgGoalsScoredHome: 2.1,
      avgGoalsConcededHome: 0.8,
      avgGoalsScoredAway: 1.1,
      avgGoalsConcededAway: 1.6,
      disclaimer: 'Predictions are statistical estimates and not guaranteed wins. Sports outcomes are inherently unpredictable.',
    };
    setSelectedAnalysis(analysis);
    setSelectedMatch(null);
    setAnalysisModalOpen(true);
  };

  const handleSelectMatchForAnalysis = (match: LiveMatch) => {
    if (match.predictionAnalysis) {
      setSelectedAnalysis(match.predictionAnalysis);
      setSelectedMatch(match);
      setAnalysisModalOpen(true);
    }
  };

  // Notification handlers
  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('safepicks_token')}` },
      });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('safepicks_token')}` },
      });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleSendFriendRequestFromChat = async (targetUserId: string, username: string) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json().catch(() => ({ error: 'Failed to send request' }));
      if (res.ok) {
        showToast(`Friend request sent to ${username}!`, 'success');
      } else {
        showToast(data.error || 'Failed to send friend request', 'error');
      }
    } catch {
      showToast('Network connection issue. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-zinc-100 flex flex-col">
      {/* 1. TOP BAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenFriends={() => setFriendsModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenAdmin={() => {
          setEditingPrediction(null);
          setAdminModalOpen(true);
        }}
        onOpenArchitecture={() => setArchitectureModalOpen(true)}
        unreadCount={unreadCount}
      />

      {/* 2. MAIN CONTENT BODY */}
      <main className="flex-1">
        {/* VIEW 1: HOME / PREDICTIONS (Highly Visible Game/Prediction Section at Top) */}
        {activeTab === 'predictions' && (
          <div>
            <AdminPredictionsHero
              predictions={predictions}
              onOpenCreateModal={() => {
                setEditingPrediction(null);
                setAdminModalOpen(true);
              }}
              onOpenEditModal={(pred) => {
                setEditingPrediction(pred);
                setAdminModalOpen(true);
              }}
              onDeletePrediction={handleDeletePrediction}
              onUpdateStatus={handleUpdateStatus}
              onSelectPredictionForAnalysis={handleSelectPredictionForAnalysis}
            />

            {/* In addition to Admin Picks at the top, show live football match radar below */}
            <LiveMatchesSection
              onSelectMatchForAnalysis={handleSelectMatchForAnalysis}
            />

            <MarketHub />
          </div>
        )}

        {/* VIEW 2: LIVE MATCHES & STANDINGS */}
        {activeTab === 'live' && (
          <LiveMatchesSection
            onSelectMatchForAnalysis={handleSelectMatchForAnalysis}
          />
        )}

        {/* VIEW 3: MARKET & BOOKMAKER SPACES */}
        {activeTab === 'market' && (
          <MarketHub />
        )}

        {/* VIEW 4: WORLDWIDE PUBLIC CHAT */}
        {activeTab === 'chat' && (
          <WorldChat
            onOpenAuth={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            onSendFriendRequest={handleSendFriendRequestFromChat}
          />
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#040609] py-8 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-white">SAFE PICKS <span className="text-emerald-400">ARENA</span></span>
            <span>·</span>
            <span>Worldwide Sports Analytics Community</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">100% Free · No VIP Subscription</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setArchitectureModalOpen(true)}
              className="text-zinc-400 hover:text-white transition"
            >
              5M+ Scalability Architecture
            </button>
            <span>·</span>
            <span className="text-zinc-500">
              Predictions are statistical estimates and not guaranteed wins.
            </span>
          </div>
        </div>
      </footer>

      {/* 4. MODALS & DRAWERS */}
      <PredictionAnalysisModal
        analysis={selectedAnalysis}
        match={selectedMatch}
        onClose={() => setAnalysisModalOpen(false)}
      />

      <FriendsModal
        isOpen={friendsModalOpen}
        onClose={() => setFriendsModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <AdminDashboardModal
        isOpen={adminModalOpen}
        editingPrediction={editingPrediction}
        onClose={() => setAdminModalOpen(false)}
        onSavePrediction={handleSavePrediction}
        onDeletePrediction={handleDeletePrediction}
      />

      <ArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
      />

      <NotificationsPopover
        isOpen={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#0B0F17]/95 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className={`h-2.5 w-2.5 rounded-full ${toastNotification.type === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-white">{toastNotification.text}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ArenaApp />
    </AuthProvider>
  );
}
