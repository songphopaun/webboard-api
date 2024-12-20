import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('SeederService', () => {
  let seederService: SeederService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    seederService = module.get<SeederService>(SeederService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should seed the database if empty', async () => {
    mockUserRepository.count.mockResolvedValue(0);
    const mockUser = { username: 'admin', img: 'https://i.pravatar.cc/300' };
    mockUserRepository.create.mockReturnValue(mockUser);

    await seederService.seed();

    expect(userRepository.count).toHaveBeenCalledTimes(1);
    expect(userRepository.create).toHaveBeenCalledWith(mockUser);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should not seed the database if it is already seeded', async () => {
    mockUserRepository.count.mockResolvedValue(1);

    await seederService.seed();

    expect(userRepository.count).toHaveBeenCalledTimes(1);
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should log appropriate messages during seeding', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    mockUserRepository.count.mockResolvedValue(0);
    const mockUser = { username: 'admin', img: 'https://i.pravatar.cc/300' };
    mockUserRepository.create.mockReturnValue(mockUser);

    await seederService.seed();

    expect(consoleSpy).toHaveBeenCalledWith('Seeding completed!');

    mockUserRepository.count.mockResolvedValue(1);

    await seederService.seed();

    expect(consoleSpy).toHaveBeenCalledWith('Database already seeded.');

    consoleSpy.mockRestore();
  });
});
