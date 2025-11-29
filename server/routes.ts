import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateHint } from "./openai";
import { 
  insertPlayerSchema, 
  submitExploitSchema, 
  hintRequestSchema,
  levels,
  difficultyConfig,
  type PlayerProgress
} from "@shared/schema";
import { z } from "zod";

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

  return httpServer;
}
