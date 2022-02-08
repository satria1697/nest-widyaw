import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  gender: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ select: false, nullable: true })
  jwt: string;
}
