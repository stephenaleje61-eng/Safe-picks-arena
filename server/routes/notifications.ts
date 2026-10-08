import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { getAuthenticatedUser } from './auth.js';

export const notificationsRouter = Router();

// GET ALL NOTIFICATIONS FOR USER
notificationsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const notifications = storage.getNotifications(user.id);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return res.json({ notifications, unreadCount });
});

// MARK SINGLE NOTIFICATION AS READ
notificationsRouter.post('/:id/read', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.params;
  storage.markNotificationAsRead(id, user.id);
  return res.json({ message: 'Marked as read.' });
});

// MARK ALL AS READ
notificationsRouter.post('/read-all', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  storage.markAllNotificationsAsRead(user.id);
  return res.json({ message: 'All notifications marked as read.' });
});
