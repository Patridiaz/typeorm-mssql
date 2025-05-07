import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bodega')
export class Bodega {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @Column('int')
  cantidad: number;

  @Column()
  unidad: string;

  @Column({ type: 'varchar', length: 20 })
  estado: string;
}
