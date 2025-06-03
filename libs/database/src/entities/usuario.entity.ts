import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { UrlEncurtadaEntity } from './url-encurtada.entity';

@Entity('usuario')
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nome: string;

  @Column({type:'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({type:'varchar', select: false, length: 255, nullable: false })
  senha: string;

   @CreateDateColumn({ name: 'data_criacao', type: 'timestamp with time zone' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'data_atualizacao', type: 'timestamp with time zone' })
  dataAtualizacao: Date;

  @DeleteDateColumn({ name: 'data_exclusao', type: 'timestamp with time zone', nullable: true })
  dataExclusao: Date | null;

  @OneToMany(() => UrlEncurtadaEntity, (urlEncurtada) => urlEncurtada.usuario)
  urlsEncurtadas: UrlEncurtadaEntity[];
}
