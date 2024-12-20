import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const newUser = this.userRepository.create({
        username: 'admin',
        img: 'https://i.pravatar.cc/300',
      });

      await this.userRepository.save(newUser);

      console.log('Seeding completed!');
    } else {
      console.log('Database already seeded.');
    }
  }
}
