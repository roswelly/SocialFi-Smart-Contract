export interface UserScore {
  UserImage: string;
  UserName: string;
  UserScore: number;
  _id?: string;
}

export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface AuthUser {
  picture: string;
  name: string;
  email: string;
}

export interface GameConfig {
  boardSize: number;
  gemTypes: number;
  minMatchLength: number;
  timeLimit: number;
} 