import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('url-encurtada')
export class UrlEncurtadaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'url_original', type: 'text', nullable: false })
  urlOriginal: string;

  @Index({ unique: true })
  @Column({
    name: 'codigo_curto',
    type: 'varchar',
    length: 6,
    unique: true,
    nullable: false,
  })
  codigoCurto: string;

  @Column({ name: 'cliques', type: 'integer', default: 0, nullable: false })
  cliques: number;

  @Column({ name: 'usuario_id', type: 'varchar', nullable: true })
  usuarioId: string | null;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp with time zone' })
  dataCriacao: Date;

  @UpdateDateColumn({
    name: 'data_atualizacao',
    type: 'timestamp with time zone',
  })
  dataAtualizacao: Date;

  @DeleteDateColumn({
    name: 'data_exclusao',
    type: 'timestamp with time zone',
    nullable: true,
  })
  dataExclusao: Date | null;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.urlsEncurtadas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity | null;
}
