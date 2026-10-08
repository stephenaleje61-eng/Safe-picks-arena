export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  bio?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  text: string;
  timestamp: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requesterId: string;
  recipientId: string;
  status: FriendshipStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'friend_accepted' | 'prediction_published' | 'system';
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface OfficialPrediction {
  id: string;
  title: string;
  match: string;
  league: string;
  kickoffTime: string;
  pick: string;
  odds: number;
  riskRating: 'Safe' | 'Medium' | 'High' | 'Banker';
  confidencePercent: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'Open' | 'Won' | 'Lost' | 'Void';
  factors: string[];
  tacticalAnalysis: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketSlip {
  id: string;
  platform: 'Bet9ja' | 'SportyBet' | 'MSport' | 'Football.com';
  bookingCode: string;
  title: string;
  totalOdds: number;
  legsCount: number;
  userId: string;
  username: string;
  legs: {
    match: string;
    league: string;
    pick: string;
    odds: number;
  }[];
  notes?: string;
  createdAt: string;
}

export interface LiveTeam {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  score?: number;
  form?: string;
}

export interface LiveMatch {
  id: string;
  league: string;
  leagueId: string;
  date: string;
  status: 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL' | 'STATUS_POSTPONED';
  statusText: string;
  minute?: string;
  homeTeam: LiveTeam;
  awayTeam: LiveTeam;
  venue?: string;
  events?: {
    type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
    minute: string;
    player: string;
    team: string;
  }[];
  stats?: {
    possession?: { home: number; away: number };
    shotsOnTarget?: { home: number; away: number };
    totalShots?: { home: number; away: number };
    corners?: { home: number; away: number };
    fouls?: { home: number; away: number };
  };
  predictionAnalysis?: MatchPredictionAnalysis;
}

export interface MatchPredictionAnalysis {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedScore: string;
  recommendedPick: string;
  confidenceScore: number;
  keyFactors: string[];
  homeRecentForm: string[];
  awayRecentForm: string[];
  headToHeadHistory: {
    date: string;
    result: string;
    score: string;
  }[];
  avgGoalsScoredHome: number;
  avgGoalsConcededHome: number;
  avgGoalsScoredAway: number;
  avgGoalsConcededAway: number;
  disclaimer: string;
}

export interface LeagueStandingRow {
  rank: number;
  team: string;
  teamLogo?: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}
