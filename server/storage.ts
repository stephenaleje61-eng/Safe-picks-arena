import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Session, 
  ChatMessage, 
  Friendship, 
  NotificationItem, 
  OfficialPrediction, 
  MarketSlip 
} from './types.js';

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  chatMessages: ChatMessage[];
  friendships: Friendship[];
  notifications: NotificationItem[];
  predictions: OfficialPrediction[];
  marketSlips: MarketSlip[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'safepicks.json');

class Storage {
  private data: DatabaseSchema = {
    users: [],
    sessions: [],
    chatMessages: [],
    friendships: [],
    notifications: [],
    predictions: [],
    marketSlips: [],
  };

  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Failed to initialize storage:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('AdminArena2026!', salt);

    // Initial administrator account
    const defaultAdmin: User = {
      id: 'usr_admin_master',
      email: 'admin@safepicksarena.com',
      username: 'ArenaAdmin',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
      bio: 'Lead Sports Analytics & Arena Administrator',
      createdAt: new Date().toISOString(),
    };

    // User's email from environment also registered as verified administrator
    const userAdmin: User = {
      id: 'usr_owner_main',
      email: 'phscspractical@gmail.com',
      username: 'ArenaDirector',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
      bio: 'Executive Director · Safe Picks Arena',
      createdAt: new Date().toISOString(),
    };

    const initialPredictions: OfficialPrediction[] = [
      {
        id: 'pred_premier_001',
        title: 'EPL Super Clash: Arsenal vs Chelsea',
        match: 'Arsenal vs Chelsea',
        league: 'English Premier League',
        kickoffTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
        pick: 'Arsenal Win or Draw & Over 1.5 Goals',
        odds: 1.48,
        riskRating: 'Safe',
        confidencePercent: 88,
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        status: 'Open',
        factors: [
          'Arsenal unbeaten at Emirates Stadium in 12 straight league ties',
          'Chelsea conceded in 7 of their last 8 away fixtures',
          'Expected goals (xG) differential: +1.42 per 90m for home side',
          'Key defensive anchors fit and starting'
        ],
        tacticalAnalysis: 'Statistical metrics indicate intense high-press supremacy from the home wingers. With both squads prioritizing rapid transitions, minimum 2 goals are expected alongside home dominance.',
        authorId: defaultAdmin.id,
        authorName: defaultAdmin.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pred_laliga_002',
        title: 'El Clasico High-Stakes Duel',
        match: 'Real Madrid vs Barcelona',
        league: 'Spanish La Liga',
        kickoffTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
        pick: 'Both Teams To Score (BTTS - Yes)',
        odds: 1.57,
        riskRating: 'Safe',
        confidencePercent: 84,
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        status: 'Open',
        factors: [
          'Past 5 consecutive head-to-head fixtures yielded Both Teams To Score',
          'Barcelona averaging 2.3 goals scored per match in 2026',
          'Real Madrid conversion rate in final third sits at 24.1%',
          'Over 2.5 goals landed in 80% of recent derbies'
        ],
        tacticalAnalysis: 'Both heavyweights play high offside traps with aggressive fullbacks. The volume of box entries virtually guarantees opportunities at both ends of the pitch.',
        authorId: defaultAdmin.id,
        authorName: defaultAdmin.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pred_ucl_003',
        title: 'Champions League Prime Banker: Man City vs Bayern Munich',
        match: 'Manchester City vs Bayern Munich',
        league: 'UEFA Champions League',
        kickoffTime: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
        pick: 'Over 2.5 Total Goals',
        odds: 1.62,
        riskRating: 'Banker',
        confidencePercent: 91,
        homeTeam: 'Manchester City',
        awayTeam: 'Bayern Munich',
        status: 'Open',
        factors: [
          'Combined goals per 90 in Champions League: 3.85',
          'Both forward lines rank top 3 in European big chances generated',
          'First leg aggregate pressure demands offensive commitment'
        ],
        tacticalAnalysis: 'Pace on the counter combined with midfield shot creation creates the premier statistical Banker pick of the European calendar week.',
        authorId: defaultAdmin.id,
        authorName: defaultAdmin.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const initialSlips: MarketSlip[] = [
      {
        id: 'slip_bet9ja_01',
        platform: 'Bet9ja',
        bookingCode: 'B9J-77291',
        title: 'Weekend European Safe 4-Fold',
        totalOdds: 3.42,
        legsCount: 4,
        userId: defaultAdmin.id,
        username: 'ArenaAdmin',
        legs: [
          { match: 'Arsenal vs Chelsea', league: 'EPL', pick: '1X & Over 1.5', odds: 1.48 },
          { match: 'Real Madrid vs Barcelona', league: 'La Liga', pick: 'BTTS Yes', odds: 1.57 },
          { match: 'Inter Milan vs AS Roma', league: 'Serie A', pick: 'Home Draw No Bet', odds: 1.25 },
          { match: 'Bayern Munich vs Dortmund', league: 'Bundesliga', pick: 'Over 2.5 Goals', odds: 1.35 },
        ],
        notes: 'Low volatility accumulator crafted with multi-factor probabilistic safety filters.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slip_sporty_02',
        platform: 'SportyBet',
        bookingCode: 'SPT-90241X',
        title: 'SportyBet High-Value Treble',
        totalOdds: 2.89,
        legsCount: 3,
        userId: defaultAdmin.id,
        username: 'ArenaAdmin',
        legs: [
          { match: 'Liverpool vs Aston Villa', league: 'EPL', pick: 'Over 2.5 Goals', odds: 1.52 },
          { match: 'Atletico Madrid vs Sevilla', league: 'La Liga', pick: 'Home Win', odds: 1.45 },
          { match: 'PSG vs Marseille', league: 'Ligue 1', pick: 'Over 1.5 Goals', odds: 1.31 },
        ],
        notes: 'Optimized for SportyBet Flexi-Cut option.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slip_msport_03',
        platform: 'MSport',
        bookingCode: 'MSP-33810',
        title: 'MSport Boosted Safe Slip',
        totalOdds: 3.15,
        legsCount: 3,
        userId: defaultAdmin.id,
        username: 'ArenaAdmin',
        legs: [
          { match: 'Man City vs Bayern', league: 'UCL', pick: 'Over 2.5', odds: 1.62 },
          { match: 'Leverkusen vs Leipzig', league: 'Bundesliga', pick: 'BTTS', odds: 1.50 },
          { match: 'Juventus vs Napoli', league: 'Serie A', pick: 'Under 3.5 Goals', odds: 1.30 },
        ],
        notes: 'Eligible for MSport Multiple Bet Bonus Boost.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'slip_ftcom_04',
        platform: 'Football.com',
        bookingCode: 'FBC-88129',
        title: 'Football.com Super Odds Banker',
        totalOdds: 2.45,
        legsCount: 2,
        userId: defaultAdmin.id,
        username: 'ArenaAdmin',
        legs: [
          { match: 'Arsenal vs Chelsea', league: 'EPL', pick: 'Arsenal Over 1.5 Team Goals', odds: 1.65 },
          { match: 'Real Madrid vs Barcelona', league: 'La Liga', pick: 'Over 2.5 Goals', odds: 1.48 },
        ],
        notes: 'High liquidity safe pick for Football.com users.',
        createdAt: new Date().toISOString(),
      }
    ];

    this.data.users = [defaultAdmin, userAdmin];
    this.data.predictions = initialPredictions;
    this.data.marketSlips = initialSlips;
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Session management
  public createSession(session: Session): void {
    // Purge expired sessions (7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.data.sessions = this.data.sessions.filter(s => s.createdAt > sevenDaysAgo);
    this.data.sessions.push(session);
    this.persist();
  }

  public findSession(token: string): Session | undefined {
    return this.data.sessions.find(s => s.token === token);
  }

  public removeSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // Chat queries
  public getChatMessages(limit = 100): ChatMessage[] {
    return this.data.chatMessages.slice(-limit);
  }

  public addChatMessage(msg: ChatMessage): ChatMessage {
    this.data.chatMessages.push(msg);
    // Keep max 2000 messages in storage
    if (this.data.chatMessages.length > 2000) {
      this.data.chatMessages = this.data.chatMessages.slice(-2000);
    }
    this.persist();
    return msg;
  }

  // Friendships
  public getFriendships(userId: string): Friendship[] {
    return this.data.friendships.filter(
      f => f.requesterId === userId || f.recipientId === userId
    );
  }

  public findFriendship(user1: string, user2: string): Friendship | undefined {
    return this.data.friendships.find(
      f => (f.requesterId === user1 && f.recipientId === user2) ||
           (f.requesterId === user2 && f.recipientId === user1)
    );
  }

  public createFriendship(friendship: Friendship): Friendship {
    this.data.friendships.push(friendship);
    this.persist();
    return friendship;
  }

  public updateFriendshipStatus(id: string, status: Friendship['status']): Friendship | undefined {
    const item = this.data.friendships.find(f => f.id === id);
    if (item) {
      item.status = status;
      this.persist();
    }
    return item;
  }

  public removeFriendship(id: string): boolean {
    const prevLen = this.data.friendships.length;
    this.data.friendships = this.data.friendships.filter(f => f.id !== id);
    if (this.data.friendships.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: NotificationItem): NotificationItem {
    this.data.notifications.push(notification);
    // Keep max 100 per user
    const userNotes = this.data.notifications.filter(n => n.userId === notification.userId);
    if (userNotes.length > 100) {
      const oldestId = userNotes[0].id;
      this.data.notifications = this.data.notifications.filter(n => n.id !== oldestId);
    }
    this.persist();
    return notification;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const note = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (note) {
      note.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    let changed = false;
    for (const note of this.data.notifications) {
      if (note.userId === userId && !note.isRead) {
        note.isRead = true;
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  // Predictions (Official Admin Picks)
  public getPredictions(): OfficialPrediction[] {
    return this.data.predictions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPredictionById(id: string): OfficialPrediction | undefined {
    return this.data.predictions.find(p => p.id === id);
  }

  public createPrediction(pred: OfficialPrediction): OfficialPrediction {
    this.data.predictions.unshift(pred);
    this.persist();
    return pred;
  }

  public updatePrediction(id: string, updates: Partial<OfficialPrediction>): OfficialPrediction | undefined {
    const idx = this.data.predictions.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.predictions[idx] = {
      ...this.data.predictions[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.predictions[idx];
  }

  public deletePrediction(id: string): boolean {
    const prev = this.data.predictions.length;
    this.data.predictions = this.data.predictions.filter(p => p.id !== id);
    if (this.data.predictions.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // Market Slips
  public getMarketSlips(platform?: string): MarketSlip[] {
    let slips = this.data.marketSlips;
    if (platform && platform !== 'all') {
      slips = slips.filter(s => s.platform.toLowerCase() === platform.toLowerCase());
    }
    return slips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createMarketSlip(slip: MarketSlip): MarketSlip {
    this.data.marketSlips.unshift(slip);
    this.persist();
    return slip;
  }
}

export const storage = new Storage();
