import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { getAuthenticatedUser } from './auth.js';
import { Friendship } from '../types.js';

export const friendsRouter = Router();

// 1. GET FRIENDS & REQUESTS
friendsRouter.get('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const allFriendships = storage.getFriendships(user.id);

  const accepted = allFriendships
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friendId = f.requesterId === user.id ? f.recipientId : f.requesterId;
      const friendUser = storage.findUserById(friendId);
      return {
        friendshipId: f.id,
        user: friendUser ? {
          id: friendUser.id,
          username: friendUser.username,
          email: friendUser.email,
          role: friendUser.role,
          bio: friendUser.bio,
        } : null,
        since: f.createdAt,
      };
    })
    .filter(item => item.user !== null);

  const pendingReceived = allFriendships
    .filter(f => f.status === 'pending' && f.recipientId === user.id)
    .map(f => {
      const requester = storage.findUserById(f.requesterId);
      return {
        friendshipId: f.id,
        requester: requester ? {
          id: requester.id,
          username: requester.username,
          email: requester.email,
          role: requester.role,
        } : null,
        createdAt: f.createdAt,
      };
    })
    .filter(item => item.requester !== null);

  const pendingSent = allFriendships
    .filter(f => f.status === 'pending' && f.requesterId === user.id)
    .map(f => {
      const recipient = storage.findUserById(f.recipientId);
      return {
        friendshipId: f.id,
        recipient: recipient ? {
          id: recipient.id,
          username: recipient.username,
          email: recipient.email,
        } : null,
        createdAt: f.createdAt,
      };
    })
    .filter(item => item.recipient !== null);

  return res.json({
    friends: accepted,
    pendingReceived,
    pendingSent,
  });
});

// 2. SEARCH REAL REGISTERED USERS
friendsRouter.get('/search', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const q = ((req.query.q as string) || '').trim().toLowerCase();

  if (!q) {
    return res.json({ users: [] });
  }

  const allUsers = storage.getUsers();
  const matched = allUsers
    .filter(u => u.id !== user?.id && (u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)))
    .slice(0, 10)
    .map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      bio: u.bio,
    }));

  return res.json({ users: matched });
});

// 3. SEND FRIEND REQUEST
friendsRouter.post('/request', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { targetUserId, targetUsername } = req.body;

  let target = targetUserId ? storage.findUserById(targetUserId) : undefined;
  if (!target && targetUsername) {
    target = storage.findUserByUsername(targetUsername);
  }

  if (!target) {
    return res.status(404).json({ error: 'User not found in Safe Picks Arena.' });
  }

  if (target.id === user.id) {
    return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
  }

  const existing = storage.findFriendship(user.id, target.id);
  if (existing) {
    if (existing.status === 'accepted') {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }
    if (existing.status === 'pending') {
      return res.status(400).json({ error: 'A friend request is already pending between you two.' });
    }
  }

  const newFriendship: Friendship = {
    id: `frnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    requesterId: user.id,
    recipientId: target.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  storage.createFriendship(newFriendship);

  // Notify recipient
  storage.addNotification({
    id: `notif_${Date.now()}`,
    userId: target.id,
    type: 'friend_request',
    title: 'New Friend Request',
    content: `${user.username} sent you a friend request.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ message: 'Friend request sent successfully.', friendship: newFriendship });
});

// 4. ACCEPT FRIEND REQUEST
friendsRouter.post('/accept', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { friendshipId } = req.body;
  if (!friendshipId) {
    return res.status(400).json({ error: 'Friendship ID is required.' });
  }

  const all = storage.getFriendships(user.id);
  const found = all.find(f => f.id === friendshipId && f.recipientId === user.id);

  if (!found) {
    return res.status(404).json({ error: 'Pending request not found.' });
  }

  storage.updateFriendshipStatus(found.id, 'accepted');

  // Notify requester
  storage.addNotification({
    id: `notif_${Date.now()}`,
    userId: found.requesterId,
    type: 'friend_accepted',
    title: 'Friend Request Accepted',
    content: `${user.username} accepted your friend request. You are now connected!`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ message: 'Friend request accepted!' });
});

// 5. DECLINE FRIEND REQUEST
friendsRouter.post('/decline', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { friendshipId } = req.body;
  if (!friendshipId) {
    return res.status(400).json({ error: 'Friendship ID is required.' });
  }

  const all = storage.getFriendships(user.id);
  const found = all.find(f => f.id === friendshipId && f.recipientId === user.id);

  if (!found) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  storage.updateFriendshipStatus(found.id, 'declined');
  return res.json({ message: 'Friend request declined.' });
});

// 6. REMOVE FRIEND
friendsRouter.post('/remove', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { friendshipId } = req.body;
  if (!friendshipId) {
    return res.status(400).json({ error: 'Friendship ID is required.' });
  }

  const success = storage.removeFriendship(friendshipId);
  if (!success) {
    return res.status(404).json({ error: 'Friendship not found.' });
  }

  return res.json({ message: 'Friend removed successfully.' });
});
