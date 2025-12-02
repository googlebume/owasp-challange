import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateHint, generateAIChallenge, verifyAIAnswer, type AIChallenge } from "./openai";
import { 
  insertPlayerSchema, 
  submitExploitSchema, 
  hintRequestSchema,
  levels,
  difficultyConfig,
  type PlayerProgress,
  type Difficulty
} from "@shared/schema";
import { z } from "zod";

const activeChallenges: Map<string, { challenges: AIChallenge[], currentStep: number }> = new Map();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/players", async (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      
      const existing = await storage.getPlayerByNickname(data.nickname);
      if (existing) {
        return res.status(400).json({ error: "Nickname already taken" });
      }
      
      const player = await storage.createPlayer(data);
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to get player" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      const leaderboard = players
        .map(p => ({
          id: p.id,
          nickname: p.nickname,
          totalScore: p.totalScore,
          levelsCompleted: p.levelsCompleted,
          achievements: p.achievements.length,
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 100);
      
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  app.post("/api/hints", async (req, res) => {
    try {
      const data = hintRequestSchema.parse(req.body);
      
      const level = levels.find(l => l.id === data.levelId);
      if (!level) {
        return res.status(404).json({ error: "Level not found" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        // Return a fallback hint if OpenAI API key is not configured
        return res.json({ hint: "Check the level description for clues. Try different approaches to the vulnerability." });
      }
      
      const hint = await generateHint({
        levelId: data.levelId,
        difficulty: data.difficulty,
        hintNumber: data.hintNumber,
        playerAttempts: data.playerAttempts,
      });
      
      res.json({ hint });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Hint generation error:", error);
      res.status(500).json({ error: "Failed to generate hint" });
    }
  });

  app.post("/api/submit", async (req, res) => {
    try {
      const data = submitExploitSchema.parse(req.body);
      
      const level = levels.find(l => l.id === data.levelId);
      if (!level) {
        return res.status(404).json({ error: "Level not found" });
      }
      
      const isCorrect = data.input.toLowerCase().trim() === level.solution.toLowerCase().trim() ||
                        data.input.toLowerCase().includes(level.solution.toLowerCase());
      
      if (isCorrect) {
        const config = difficultyConfig[data.difficulty];
        const timeBonus = Math.max(0, 100 - Math.floor(data.timeSpent / 10));
        const hintPenalty = data.hintsUsed * 25;
        const score = Math.max(10, Math.floor((level.basePoints + timeBonus - hintPenalty) * config.multiplier));
        
        res.json({
          success: true,
          score,
          explanation: level.explanation,
        });
      } else {
        res.json({
          success: false,
          message: "Incorrect solution. Try again!",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit solution" });
    }
  });

  app.get("/api/levels", async (req, res) => {
    try {
      const levelsData = levels.map(l => ({
        id: l.id,
        name: l.name,
        nameUa: l.nameUa,
        description: l.description,
        descriptionUa: l.descriptionUa,
        vulnerability: l.vulnerability,
        category: l.category,
        basePoints: l.basePoints,
        simulationType: l.simulationType,
        objective: l.objective,
        objectiveUa: l.objectiveUa,
      }));
      res.json(levelsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get levels" });
    }
  });

  app.get("/api/levels/:id", async (req, res) => {
    try {
      const levelId = parseInt(req.params.id);
      const level = levels.find(l => l.id === levelId);
      
      if (!level) {
        return res.status(404).json({ error: "Level not found" });
      }
      
      const { solution, ...levelData } = level;
      res.json(levelData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get level" });
    }
  });

  app.post("/api/ai-challenge/generate", async (req, res) => {
    try {
      const { levelId, difficulty, sessionId } = req.body;
      
      const level = levels.find(l => l.id === levelId);
      if (!level || !level.isAIGenerated) {
        return res.status(400).json({ error: "Not an AI-generated level" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "AI features are not available. Please configure OPENAI_API_KEY." });
      }

      const totalSteps = level.requiredInputs || 1;
      const challenges: AIChallenge[] = [];

      for (let i = 1; i <= totalSteps; i++) {
        const challenge = await generateAIChallenge(difficulty as Difficulty, i, totalSteps);
        challenges.push(challenge);
      }

      activeChallenges.set(sessionId, { challenges, currentStep: 0 });

      res.json({
        scenario: challenges[0].scenario,
        currentStep: 1,
        totalSteps
      });
    } catch (error) {
      console.error("AI challenge generation error:", error);
      res.status(500).json({ error: "Failed to generate AI challenge" });
    }
  });

  app.post("/api/ai-challenge/verify", async (req, res) => {
    try {
      const { sessionId, answer } = req.body;

      const session = activeChallenges.get(sessionId);
      if (!session) {
        return res.status(400).json({ error: "No active challenge session" });
      }

      const currentChallenge = session.challenges[session.currentStep];
      const result = await verifyAIAnswer(currentChallenge, answer);

      if (result.isCorrect) {
        session.currentStep++;
        
        if (session.currentStep >= session.challenges.length) {
          activeChallenges.delete(sessionId);
          return res.json({
            success: true,
            completed: true,
            feedback: result.feedback
          });
        } else {
          const nextChallenge = session.challenges[session.currentStep];
          return res.json({
            success: true,
            completed: false,
            feedback: result.feedback,
            nextScenario: nextChallenge.scenario,
            currentStep: session.currentStep + 1,
            totalSteps: session.challenges.length
          });
        }
      } else {
        return res.json({
          success: false,
          completed: false,
          feedback: result.feedback
        });
      }
    } catch (error) {
      console.error("AI challenge verification error:", error);
      res.status(500).json({ error: "Failed to verify answer" });
    }
  });

  return httpServer;
}
