import React from 'react';
import { NotificationItem } from '../types/client.ts';
import { X, CheckCheck, Bell, MessageSquare, UserCheck, Flame, Info } from 'lucide-react';

interface NotificationsPopoverProps {
  isOpen: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0B0F17] shadow-2xl p-4 text-white mt-14 sm:mr-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-400" />
            <h4 className="font-heading text-sm font-bold text-white">Notifications</h4>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No notifications yet. You will be alerted when new friend requests or official picks arrive.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  n.isRead
                    ? 'border-zinc-800/60 bg-zinc-950/40 opacity-75'
                    : 'border-emerald-500/40 bg-zinc-900/90'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'prediction_published' && <Flame className="h-4 w-4 text-emerald-400" />}
                    {n.type === 'friend_request' && <UserCheck className="h-4 w-4 text-blue-400" />}
                    {n.type === 'friend_accepted' && <UserCheck className="h-4 w-4 text-emerald-400" />}
                    {n.type === 'message' && <MessageSquare className="h-4 w-4 text-purple-400" />}
                    {n.type === 'system' && <Info className="h-4 w-4 text-emerald-400" />}
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{n.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-300 leading-snug">{n.content}</p>
                    <span className="mt-1 block font-mono text-[10px] text-zinc-500 tabular-nums">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
