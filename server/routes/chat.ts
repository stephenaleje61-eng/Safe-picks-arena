import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { getAuthenticatedUser } from './auth.js';
import { ChatMessage } from '../types.js';

export const chatRouter = Router();

// In-memory SSE client connections for real-time worldwide broadcast
type SSEClient = {
  id: string;
  res: Response;
};
let clients: SSEClient[] = [];

export function broadcastChatMessage(msg: ChatMessage) {
  const data = JSON.stringify({ type: 'message', payload: msg });
  clients.forEach(client => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// 1. GET MESSAGES (Paginated / Last 100)
chatRouter.get('/messages', (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '50', 10)));
  const messages = storage.getChatMessages(limit);
  return res.json({ messages });
});

// 2. POST MESSAGE (Instant worldwide publication)
chatRouter.post('/messages', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to send messages.' });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const cleanText = text.trim();
  if (cleanText.length > 500) {
    return res.status(400).json({ error: 'Message cannot exceed 500 characters.' });
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    username: user.username,
    role: user.role,
    text: cleanText,
    timestamp: new Date().toISOString(),
  };

  storage.addChatMessage(newMsg);
  broadcastChatMessage(newMsg);

  return res.status(201).json({ message: newMsg });
});

// 3. SSE STREAM FOR REAL-TIME INSTANT FEED
chatRouter.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random()}`;
  const newClient: SSEClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial keep-alive ping
  res.write(`data: ${JSON.stringify({ type: 'connected', clientsCount: clients.length })}\n\n`);

  // Heartbeat every 25 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter(c => c.id !== clientId);
  });
});
