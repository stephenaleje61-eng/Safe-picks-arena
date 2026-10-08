import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Send, MessageSquare, Shield, UserPlus, Radio, Lock } from 'lucide-react';

interface WorldChatProps {
  onOpenAuth: () => void;
  onSendFriendRequest: (userId: string, username: string) => void;
}

export const WorldChat: React.FC<WorldChatProps> = ({
  onOpenAuth,
  onSendFriendRequest,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial message load
  const loadMessages = async () => {
    try {
      const res = await fetch('/api/chat/messages?limit=60');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // offline
    }
  };

  // 2. SSE Real-Time Stream for instant worldwide message propagation
  useEffect(() => {
    loadMessages();

    const eventSource = new EventSource('/api/chat/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'message' && payload.payload) {
          setMessages((prev) => {
            // deduplicate by id
            if (prev.some((m) => m.id === payload.payload.id)) return prev;
            return [...prev, payload.payload];
          });
        } else if (payload.type === 'connected') {
          setOnlineCount(Math.max(1, payload.clientsCount || 1));
        }
      } catch {
        // ignore parse error / heartbeat
      }
    };

    eventSource.onerror = () => {
      // Automatic reconnect handled by browser
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!inputText.trim()) return;

    setIsSending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to send message');
      } else {
        setInputText('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col h-[750px] rounded-2xl border border-zinc-800 bg-[#0B0F17] shadow-2xl overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-black text-white">
                  Worldwide Public Arena Chat
                </h3>
                <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-400" />
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Discuss live match momentum, tactics, and slip codes globally. Real users only.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono tabular-nums">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{onlineCount} Arena Member{onlineCount > 1 ? 's' : ''} Live</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
              <MessageSquare className="h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-sm font-semibold text-zinc-400">No chat messages yet</p>
              <p className="text-xs max-w-sm mt-1">
                Be the first to post your match analysis or commentary in the worldwide arena!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = user?.id === msg.userId;
              const isAdmin = msg.role === 'admin';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${
                    isAdmin ? 'bg-emerald-500 text-black ring-2 ring-emerald-500/30' : 'bg-zinc-800 text-zinc-200'
                  }`}>
                    {msg.username.slice(0, 1).toUpperCase()}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-md rounded-2xl px-4 py-2.5 text-xs ${
                    isMe
                      ? 'bg-emerald-500 text-black rounded-tr-none'
                      : 'bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isMe ? 'text-black' : 'text-white'}`}>
                          {msg.username}
                        </span>

                        {isAdmin && (
                          <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                            isMe ? 'bg-black text-emerald-400' : 'bg-emerald-500 text-black'
                          }`}>
                            <Shield className="h-2.5 w-2.5" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono tabular-nums ${isMe ? 'text-black/60' : 'text-zinc-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {!isMe && user && (
                          <button
                            onClick={() => onSendFriendRequest(msg.userId, msg.username)}
                            title="Add Friend"
                            className="text-zinc-400 hover:text-emerald-400 transition"
                          >
                            <UserPlus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px]">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
          {errorMsg && (
            <p className="mb-2 text-xs text-rose-400 font-medium">
              {errorMsg}
            </p>
          )}

          {user ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Broadcast your match prediction or question to the arena worldwide..."
                maxLength={500}
                disabled={isSending}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Sign in to participate in the worldwide public chat arena.</span>
              </div>
              <button
                onClick={onOpenAuth}
                className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
