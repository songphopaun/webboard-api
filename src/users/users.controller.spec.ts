import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { standardResponse } from '../response.util';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'testuser',
};

const mockUsersService = {
  findByUsername: jest.fn().mockResolvedValue(mockUser),
  getAccessToken: jest.fn().mockReturnValue('access-token'),
  getRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({ id: 1 }),
};

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should login successfully', async () => {
    const mockRes = {
      cookie: jest.fn(),
      json: jest.fn(),
    } as any;

    await usersController.login({ username: 'testuser' }, mockRes);

    expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
    expect(mockUsersService.getAccessToken).toHaveBeenCalledWith({
      id: mockUser.id,
    });
    expect(mockUsersService.getRefreshToken).toHaveBeenCalledWith({
      id: mockUser.id,
    });
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/users/refresh',
      },
    );
    expect(mockRes.json).toHaveBeenCalledWith(
      standardResponse(200, 'Login successful', {
        accessToken: 'access-token',
        user: mockUser,
      }),
    );
  });

  it('should refresh tokens successfully', async () => {
    const mockReq = { cookies: { refresh_token: 'valid-token' } } as any;
    const mockRes = {
      cookie: jest.fn(),
      json: jest.fn(),
    } as any;

    await usersController.refresh(mockReq, mockRes);

    expect(mockUsersService.verifyRefreshToken).toHaveBeenCalledWith(
      'valid-token',
    );
    expect(mockUsersService.getAccessToken).toHaveBeenCalledWith({ id: 1 });
    expect(mockUsersService.getRefreshToken).toHaveBeenCalledWith({ id: 1 });
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/users/refresh',
      },
    );
    expect(mockRes.json).toHaveBeenCalledWith(
      standardResponse(200, 'refresh token successful', {
        accessToken: 'access-token',
      }),
    );
  });

  it('should throw UnauthorizedException if no refresh token is provided', async () => {
    const mockReq = { cookies: {} } as any;
    const mockRes = {
      cookie: jest.fn(),
      json: jest.fn(),
    } as any;

    await expect(usersController.refresh(mockReq, mockRes)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
