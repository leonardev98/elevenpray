import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('community_post_likes')
export class CommunityPostLike {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
