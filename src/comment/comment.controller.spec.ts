import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    img: 'https://example.com/avatar.jpg',
  };

  const mockComment = {
    id: 1,
    content: 'Test comment',
    user: mockUser,
    post: { id: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getCommentsByPost: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the JwtAuthGuard
      .useValue({
        canActivate: jest.fn(() => true), // Always allow access
      })
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto = { content: 'Test comment', postId: 1 };
      jest.spyOn(service, 'create').mockResolvedValue(mockComment as any);

      const result = await controller.create(createCommentDto, {
        user: mockUser,
      } as any);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Create successfully');
      expect(result.data).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith(
        createCommentDto,
        mockUser.id,
      );
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateCommentDto = { content: 'Updated comment' };
      const updatedComment = {
        ...mockComment,
        content: updateCommentDto.content,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedComment as any);

      const result = await controller.update(1, updateCommentDto, {
        user: mockUser,
      } as any);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Update successfully');
      expect(result.data).toEqual(updatedComment);
      expect(service.update).toHaveBeenCalledWith(
        1,
        updateCommentDto,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(1, { user: mockUser } as any);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Deleted successfully');
      expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('getCommentsByPost', () => {
    it('should get comments by post id', async () => {
      const mockComments = [mockComment];
      jest
        .spyOn(service, 'getCommentsByPost')
        .mockResolvedValue(mockComments as any);

      const result = await controller.getCommentsByPost(1);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('get comment by post successfully');
      expect(result.data).toEqual(mockComments);
      expect(service.getCommentsByPost).toHaveBeenCalledWith(1);
    });
  });
});
