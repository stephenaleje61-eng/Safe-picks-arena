import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { getAuthenticatedUser } from './auth.js';
import { MarketSlip } from '../types.js';

export const marketRouter = Router();

// Platform specs, bonuses, and features
export const PLATFORM_INFO = {
  Bet9ja: {
    name: 'Bet9ja',
    country: 'Nigeria & Worldwide',
    features: ['170% Multiple Boost', 'Cut 1 Feature', 'Cash Out', 'Super9ja Free Jackpot'],
    bonusTiers: [
      { legs: 5, bonus: '5%' },
      { legs: 10, bonus: '30%' },
      { legs: 15, bonus: '60%' },
      { legs: 20, bonus: '100%' },
      { legs: 25, bonus: '135%' },
      { legs: 30, bonus: '170%' },
    ],
    codeFormat: 'B9J-XXXXX (5-7 alphanumeric chars)',
    primaryColor: '#00843D',
  },
  SportyBet: {
    name: 'SportyBet',
    country: 'Nigeria, Ghana, Kenya & Worldwide',
    features: ['Instant Cash Out', 'Sporty Flexi Bet (Permutation)', '1000% Super Multiple Bonus', 'Live Match Tracker'],
    bonusTiers: [
      { legs: 3, bonus: '3%' },
      { legs: 6, bonus: '15%' },
      { legs: 12, bonus: '45%' },
      { legs: 20, bonus: '120%' },
      { legs: 35, bonus: '350%' },
      { legs: 50, bonus: '1000%' },
    ],
    codeFormat: 'SPT-XXXXXX (6 alphanumeric chars)',
    primaryColor: '#E41C25',
  },
  MSport: {
    name: 'MSport',
    country: 'Nigeria, Ghana, Uganda & Worldwide',
    features: ['Vouchers & Cashback', 'Up to 500,000 NGN Weekly Draw', 'Million-Dollar Jackpot', 'Zero-Fee Withdrawals'],
    bonusTiers: [
      { legs: 4, bonus: '5%' },
      { legs: 8, bonus: '25%' },
      { legs: 15, bonus: '55%' },
      { legs: 25, bonus: '110%' },
      { legs: 30, bonus: '180%' },
    ],
    codeFormat: 'MSP-XXXXX (5 alphanumeric chars)',
    primaryColor: '#FF6F00',
  },
  'Football.com': {
    name: 'Football.com',
    country: 'Global Coverage',
    features: ['Zero Margin Super Odds', 'Weekly Predictor Cash', 'High Liquidity Markets', 'Ultra-fast Bet Placement'],
    bonusTiers: [
      { legs: 3, bonus: '5%' },
      { legs: 7, bonus: '20%' },
      { legs: 14, bonus: '50%' },
      { legs: 21, bonus: '100%' },
      { legs: 28, bonus: '150%' },
    ],
    codeFormat: 'FBC-XXXXX (5-6 alphanumeric chars)',
    primaryColor: '#1A73E8',
  },
};

// 1. GET ALL PLATFORM SLIPS
marketRouter.get('/slips', (req: Request, res: Response) => {
  const platform = req.query.platform as string;
  const slips = storage.getMarketSlips(platform);
  return res.json({ slips, platforms: PLATFORM_INFO });
});

// 2. GET PLATFORM INFO
marketRouter.get('/platforms', (_req: Request, res: Response) => {
  return res.json({ platforms: PLATFORM_INFO });
});

// 3. SHARE / SUBMIT BOOKING CODE
marketRouter.post('/slips', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to share a booking slip.' });
  }

  const { platform, bookingCode, title, totalOdds, legs, notes } = req.body;

  if (!platform || !bookingCode || !title) {
    return res.status(400).json({ error: 'Platform, booking code, and title are required.' });
  }

  const validPlatforms = ['Bet9ja', 'SportyBet', 'MSport', 'Football.com'];
  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({ error: 'Platform must be Bet9ja, SportyBet, MSport, or Football.com' });
  }

  const newSlip: MarketSlip = {
    id: `slip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    platform,
    bookingCode: bookingCode.trim().toUpperCase(),
    title: title.trim(),
    totalOdds: parseFloat(totalOdds) || 2.5,
    legsCount: Array.isArray(legs) ? legs.length : 3,
    userId: user.id,
    username: user.username,
    legs: Array.isArray(legs) && legs.length > 0 ? legs : [
      { match: 'Upcoming Featured Fixture', league: 'Top League', pick: 'Safe Pick', odds: 1.5 }
    ],
    notes: notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  storage.createMarketSlip(newSlip);

  return res.status(201).json({
    message: 'Booking code shared to Safe Picks Arena Market!',
    slip: newSlip,
  });
});
