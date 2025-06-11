export interface UserScore {
  UserImage: string;
  UserName: string;
  UserScore: number;
  _id?: string;
}

export interface ScoreRequest {
  userImage: string;
  userName: string;
  userScore: number;
} 