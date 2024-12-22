import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Community } from './entities/community.entity';
import { NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostService', () => {
  let service: PostService;
  let postRepository: Repository<Post>;
  let communityRepository: Repository<Community>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockCommunity: Community = {
    id: 1,
    name: 'Test Community',
    posts: [],
  };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    community: mockCommunity,
    user: mockUser as any,
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Community),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    communityRepository = module.get<Repository<Community>>(
      getRepositoryToken(Community),
    );
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        communityId: 1,
      };

      jest
        .spyOn(communityRepository, 'findOne')
        .mockResolvedValue(mockCommunity);
      jest.spyOn(postRepository, 'create').mockReturnValue(mockPost);
      jest.spyOn(postRepository, 'save').mockResolvedValue(mockPost);

      const result = await service.create(createPostDto, mockUser.id);

      expect(result).toEqual(mockPost);
      expect(communityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when community not found', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        communityId: 999,
      };

      jest.spyOn(communityRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createPostDto, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
      };
      const updatedPost = { ...mockPost, ...updatePostDto };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost);
      jest.spyOn(postRepository, 'save').mockResolvedValue(updatedPost);

      const result = await service.update(1, updatePostDto);

      expect(result).toEqual(updatedPost);
      expect(postRepository.save).toHaveBeenCalledWith(updatedPost);
    });

    it('should update post with new community', async () => {
      const newCommunity = { ...mockCommunity, id: 2 };
      const updatePostDto: UpdatePostDto = {
        communityId: 2,
      };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost);
      jest
        .spyOn(communityRepository, 'findOne')
        .mockResolvedValue(newCommunity);
      jest.spyOn(postRepository, 'save').mockResolvedValue({
        ...mockPost,
        community: newCommunity,
      });

      const result = await service.update(1, updatePostDto);

      expect(result.community).toEqual(newCommunity);
      expect(communityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update(999, { title: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(mockPost);
      jest
        .spyOn(postRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(postRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      const result = await service.findAll();

      expect(result).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        relations: ['community', 'user', 'comments'],
        order: { id: 'DESC' },
      });
    });

    it('should return posts filtered by community', async () => {
      const posts = [mockPost];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      const result = await service.findAll(1);

      expect(result).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { community: { id: 1 } },
        relations: ['community', 'user', 'comments'],
        order: { id: 'DESC' },
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return all posts by user', async () => {
      const posts = [mockPost];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      const result = await service.findAllByUser(1);

      expect(result).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['community', 'user', 'comments'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return user posts filtered by community', async () => {
      const posts = [mockPost];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      const result = await service.findAllByUser(1, 1);

      expect(result).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: 1 },
          community: { id: 1 },
        },
        relations: ['community', 'user', 'comments'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findAllCommunity', () => {
    it('should return all communities', async () => {
      const communities = [mockCommunity];
      jest.spyOn(communityRepository, 'find').mockResolvedValue(communities);

      const result = await service.findAllCommunity();

      expect(result).toEqual(communities);
      expect(communityRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByPost', () => {
    it('should return post by id with relations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockPost),
      };

      jest
        .spyOn(postRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findByPost(1);

      expect(result).toEqual(mockPost);
      expect(postRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('post.id = :postId', {
        postId: 1,
      });
    });
  });
});
