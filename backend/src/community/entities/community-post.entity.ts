import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const COMMUNITY_POST_TYPES = ['apunte', 'plantilla', 'pdf'] as const;
export type CommunityPostType = (typeof COMMUNITY_POST_TYPES)[number];

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  type: CommunityPostType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'text', nullable: true })
  course: string | null;

  @Column({ type: 'text', nullable: true })
  university: string | null;

  @Column({ name: 'attachment_url', type: 'text', nullable: true })
  attachmentUrl: string | null;

  @Column({ name: 'attachment_name', type: 'text', nullable: true })
  attachmentName: string | null;

  @Column({ name: 'attachment_size_bytes', type: 'bigint', nullable: true })
  attachmentSizeBytes: string | null;

  @Column({ name: 'attachment_mime', type: 'text', nullable: true })
  attachmentMime: string | null;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
