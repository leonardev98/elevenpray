import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('community_answer_votes')
export class CommunityAnswerVote {
  @PrimaryColumn({ name: 'answer_id', type: 'uuid' })
  answerId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
