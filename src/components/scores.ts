import mongoose, { Schema, Document } from 'mongoose';
import { UserScore } from '../types';

const scoreSchema = new Schema<UserScore>({
  UserImage: { type: String, required: true },
  UserName: { type: String, required: true },
  UserScore: { type: Number, required: true }
});

export default mongoose.model<UserScore>('Score', scoreSchema); 