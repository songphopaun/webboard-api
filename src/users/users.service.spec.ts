import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'testuser',
};

const mockUsersRepository = {
  findOneBy: jest.fn().mockResolvedValue(mockUser),
};

const mockJwtService = {
  sign: jest.fn((payload) => `signed-${JSON.stringify(payload)}`),
  verify: jest.fn((token) => {
    if (token === 'valid-token') return { id: 1 };
    throw new Error('Invalid token');
  }),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'ACCESS_TOKEN_SECRET') return 'access-secret';
    if (key === 'REFRESH_TOKEN_SECRET') return 'refresh-secret';
    return null;
  }),
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find a user by username', async () => {
    const result = await usersService.findByUsername('testuser');
    expect(result).toEqual(mockUser);
    expect(usersRepository.findOneBy).toHaveBeenCalledWith({
      username: 'testuser',
    });
  });

  it('should generate an access token', () => {
    const token = usersService.getAccessToken({ id: 1 });
    expect(token).toEqual('signed-{"id":1}');
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      { id: 1 },
      { secret: 'access-secret', expiresIn: '15m' },
    );
  });

  it('should generate a refresh token', () => {
    const token = usersService.getRefreshToken({ id: 1 });
    expect(token).toEqual('signed-{"id":1}');
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      { id: 1 },
      { secret: 'refresh-secret', expiresIn: '7d' },
    );
  });

  it('should verify a valid refresh token', () => {
    const payload = usersService.verifyRefreshToken('valid-token');
    expect(payload).toEqual({ id: 1 });
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', {
      secret: 'refresh-secret',
    });
  });

  it('should throw UnauthorizedException for an invalid refresh token', () => {
    expect(() => usersService.verifyRefreshToken('invalid-token')).toThrow(
      UnauthorizedException,
    );
  });
});
