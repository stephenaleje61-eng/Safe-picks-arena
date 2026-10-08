import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { getAuthenticatedUser } from './auth.js';
import { OfficialPrediction } from '../types.js';

export const predictionsRouter = Router();

// 1. GET ALL OFFICIAL PREDICTIONS (Publicly accessible, 100% free, no VIP locks)
predictionsRouter.get('/', (req: Request, res: Response) => {
  const predictions = storage.getPredictions();
  return res.json({ predictions });
});

// 2. GET SINGLE PREDICTION
predictionsRouter.get('/:id', (req: Request, res: Response) => {
  const prediction = storage.getPredictionById(req.params.id);
  if (!prediction) {
    return res.status(404).json({ error: 'Prediction not found.' });
  }
  return res.json({ prediction });
});

// 3. CREATE OFFICIAL PREDICTION (Admin only)
predictionsRouter.post('/', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required to publish official predictions.' });
  }

  const {
    title,
    match,
    league,
    kickoffTime,
    pick,
    odds,
    riskRating,
    confidencePercent,
    homeTeam,
    awayTeam,
    factors,
    tacticalAnalysis,
  } = req.body;

  if (!title || !match || !pick || !odds) {
    return res.status(400).json({ error: 'Title, match, pick, and odds are required.' });
  }

  const newPrediction: OfficialPrediction = {
    id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    match: match.trim(),
    league: league || 'World Football',
    kickoffTime: kickoffTime || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    pick: pick.trim(),
    odds: parseFloat(odds) || 1.5,
    riskRating: riskRating || 'Safe',
    confidencePercent: parseInt(confidencePercent, 10) || 85,
    homeTeam: homeTeam || match.split('vs')[0]?.trim() || 'Home',
    awayTeam: awayTeam || match.split('vs')[1]?.trim() || 'Away',
    status: 'Open',
    factors: Array.isArray(factors) && factors.length > 0 ? factors : [
      'Grounded in rolling 10-match home/away xG differential',
      'Tactical matchup dynamics strongly favor this selection'
    ],
    tacticalAnalysis: tacticalAnalysis || 'Our analytical modeling rates this match as an optimal risk-adjusted probability outcome.',
    authorId: user.id,
    authorName: user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storage.createPrediction(newPrediction);

  // Notify all registered users of this new official pick
  const users = storage.getUsers();
  users.forEach(u => {
    if (u.id !== user.id) {
      storage.addNotification({
        id: `notif_${Date.now()}_${u.id}`,
        userId: u.id,
        type: 'prediction_published',
        title: 'New Official Safe Pick Published!',
        content: `Admin ${user.username} just posted: ${newPrediction.match} - Pick: ${newPrediction.pick} (@${newPrediction.odds})`,
        link: `/predictions/${newPrediction.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return res.status(201).json({
    message: 'Official prediction published instantly for all users!',
    prediction: newPrediction,
  });
});

// 4. EDIT OFFICIAL PREDICTION (Admin only)
predictionsRouter.put('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required to edit predictions.' });
  }

  const { id } = req.params;
  const updates = req.body;

  const existing = storage.getPredictionById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Prediction not found.' });
  }

  const updated = storage.updatePrediction(id, updates);
  return res.json({
    message: 'Prediction updated successfully.',
    prediction: updated,
  });
});

// 5. REMOVE OFFICIAL PREDICTION (Admin only)
predictionsRouter.delete('/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required to delete predictions.' });
  }

  const { id } = req.params;
  const deleted = storage.deletePrediction(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Prediction not found.' });
  }

  return res.json({ message: 'Prediction removed successfully.' });
});
