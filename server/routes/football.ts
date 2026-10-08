import { Router, Request, Response } from 'express';
import {
  fetchLiveMatches,
  fetchLeagueStandings,
  calculateStatisticalPrediction,
  LEAGUES_CONFIG
} from '../sportsApi.js';

export const footballRouter = Router();

// 1. GET LIST OF SUPPORTED MAJOR LEAGUES
footballRouter.get('/leagues', (_req: Request, res: Response) => {
  return res.json({ leagues: LEAGUES_CONFIG });
});

// 2. GET LIVE / FIXTURES / RESULTS FOR LEAGUE
footballRouter.get('/matches', async (req: Request, res: Response) => {
  const leagueId = (req.query.league as string) || 'eng.1';
  const result = await fetchLiveMatches(leagueId);

  if (result.error && (!result.matches || result.matches.length === 0)) {
    return res.status(200).json({
      matches: [],
      error: 'Data unavailable',
      message: 'Sports data currently unavailable from upstream feeds.'
    });
  }

  // Enrich each match with statistical prediction modeling
  const enriched = result.matches.map(m => {
    const analysis = calculateStatisticalPrediction(
      m.homeTeam.name,
      m.awayTeam.name,
      m.league,
      m.homeTeam.form,
      m.awayTeam.form
    );
    return {
      ...m,
      predictionAnalysis: analysis,
    };
  });

  return res.json({
    leagueId,
    matches: enriched,
    count: enriched.length,
    timestamp: new Date().toISOString(),
  });
});

// 3. GET SINGLE MATCH DETAILS & PREDICTION ANALYSIS
footballRouter.get('/matches/:id', async (req: Request, res: Response) => {
  const matchId = req.params.id;
  const leagueId = (req.query.league as string) || 'eng.1';
  const result = await fetchLiveMatches(leagueId);

  const match = result.matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({
      error: 'Data unavailable',
      message: 'Match statistics or event details unavailable for this ID.'
    });
  }

  const analysis = calculateStatisticalPrediction(
    match.homeTeam.name,
    match.awayTeam.name,
    match.league,
    match.homeTeam.form,
    match.awayTeam.form
  );

  return res.json({
    match: {
      ...match,
      predictionAnalysis: analysis,
    }
  });
});

// 4. GET LEAGUE STANDINGS / TABLES
footballRouter.get('/standings', async (req: Request, res: Response) => {
  const leagueId = (req.query.league as string) || 'eng.1';
  const result = await fetchLeagueStandings(leagueId);

  if (result.error && (!result.standings || result.standings.length === 0)) {
    return res.status(200).json({
      standings: [],
      error: 'Data unavailable',
      message: 'Standings data currently unavailable for this league.'
    });
  }

  return res.json({
    leagueId,
    standings: result.standings,
  });
});
