import { type Player, type InsertPlayer, type PlayerProgress, type Difficulty } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByNickname(nickname: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerProgress(playerId: string, progress: PlayerProgress): Promise<Player | undefined>;
  updatePlayerScore(playerId: string, scoreToAdd: number): Promise<Player | undefined>;
  addAchievement(playerId: string, achievementId: string): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
}

export class MemStorage implements IStorage {
  private players: Map<string, Player>;

  constructor() {
    this.players = new Map();
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByNickname(nickname: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      (player) => player.nickname.toLowerCase() === nickname.toLowerCase(),
    );
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { 
      id, 
      nickname: insertPlayer.nickname,
      totalScore: 0,
      levelsCompleted: 0,
      achievements: [],
      progress: {},
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayerProgress(playerId: string, progress: PlayerProgress): Promise<Player | undefined> {
    const player = this.players.get(playerId);
    if (!player) return undefined;

    const key = `${progress.levelId}-${progress.difficulty}`;
    const existingProgress = player.progress[key];
    
    const updatedPlayer: Player = {
      ...player,
      progress: {
        ...player.progress,
        [key]: {
          ...progress,
          score: existingProgress ? Math.max(existingProgress.score, progress.score) : progress.score,
        },
      },
    };

    const completedLevels = new Set(
      Object.values(updatedPlayer.progress)
        .filter(p => p.completed)
        .map(p => p.levelId)
    );
    updatedPlayer.levelsCompleted = completedLevels.size;

    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  async updatePlayerScore(playerId: string, scoreToAdd: number): Promise<Player | undefined> {
    const player = this.players.get(playerId);
    if (!player) return undefined;

    const updatedPlayer: Player = {
      ...player,
      totalScore: player.totalScore + scoreToAdd,
    };

    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  async addAchievement(playerId: string, achievementId: string): Promise<Player | undefined> {
    const player = this.players.get(playerId);
    if (!player) return undefined;

    if (player.achievements.includes(achievementId)) {
      return player;
    }

    const updatedPlayer: Player = {
      ...player,
      achievements: [...player.achievements, achievementId],
    };

    this.players.set(playerId, updatedPlayer);
    return updatedPlayer;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
}

export const storage = new MemStorage();
