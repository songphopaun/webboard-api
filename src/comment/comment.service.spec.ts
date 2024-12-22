import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { NotFoundException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepository: Repository<Comment>;
  let postRepository: Repository<Post>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    img: 'https://example.com/avatar.jpg',
  };

  const mockPost = { id: 1, title: 'Test post' };
  const mockComment = {
    id: 1,
    content: 'Test comment',
    user: mockUser,
    post: mockPost,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto = { content: 'Test comment', postId: 1 };
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost as any);
      jest
        .spyOn(commentRepository, 'create')
        .mockReturnValue(mockComment as any);
      jest
        .spyOn(commentRepository, 'save')
        .mockResolvedValue(mockComment as any);

      const result = await service.create(createCommentDto, mockUser.id);

      expect(result).toEqual(mockComment);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCommentDto.postId },
      });
      expect(commentRepository.create).toHaveBeenCalledWith({
        content: createCommentDto.content,
        post: mockPost,
        user: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      const createCommentDto = { content: 'Test comment', postId: 999 };
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create(createCommentDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateCommentDto = { content: 'Updated comment' };
      const updatedComment = { ...mockComment, ...updateCommentDto };
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValue(mockComment as any);
      jest
        .spyOn(commentRepository, 'save')
        .mockResolvedValue(updatedComment as any);

      const result = await service.update(1, updateCommentDto, mockUser.id);

      expect(result).toEqual(updatedComment);
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: mockUser.id } },
      });
    });

    it('should throw NotFoundException when comment not found', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(999, { content: 'test' }, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      jest
        .spyOn(commentRepository, 'findOne')
        .mockResolvedValue(mockComment as any);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

      await service.remove(1, mockUser.id);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: mockUser.id } },
      });
      expect(commentRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when comment not found', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCommentsByPost', () => {
    it('should get comments by post id', async () => {
      const mockComments = [mockComment];
      jest
        .spyOn(commentRepository, 'find')
        .mockResolvedValue(mockComments as any);

      const result = await service.getCommentsByPost(1);

      expect(result).toEqual(mockComments);
      expect(commentRepository.find).toHaveBeenCalledWith({
        where: { post: { id: 1 } },
        relations: ['user'],
      });
    });
  });
});
