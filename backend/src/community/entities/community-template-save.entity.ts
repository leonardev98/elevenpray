import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('community_template_saves')
export class CommunityTemplateSave {
  @PrimaryColumn({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
