import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { Community } from './entities/community.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

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
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            findAllByUser: jest.fn(),
            findAllCommunity: jest.fn(),
            findByPost: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        communityId: 1,
      };
      const req = { user: mockUser };

      jest.spyOn(service, 'create').mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto, req as any);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Create successfully',
        data: mockPost,
      });
      expect(service.create).toHaveBeenCalledWith(createPostDto, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
      };
      const postId = 1;

      jest.spyOn(service, 'update').mockResolvedValue(mockPost);

      const result = await controller.update(postId, updatePostDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Update successfully',
        data: mockPost,
      });
      expect(service.update).toHaveBeenCalledWith(postId, updatePostDto);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove(postId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Deleted successfully',
      });
      expect(service.remove).toHaveBeenCalledWith(postId);
    });
  });

  describe('findAllPosts', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      jest.spyOn(service, 'findAll').mockResolvedValue(posts);

      const result = await controller.findAllPosts();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Get posts successfully',
        data: posts,
      });
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return posts filtered by community', async () => {
      const posts = [mockPost];
      const communityId = 1;

      jest.spyOn(service, 'findAll').mockResolvedValue(posts);

      const result = await controller.findAllPosts(communityId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Get posts successfully',
        data: posts,
      });
      expect(service.findAll).toHaveBeenCalledWith(communityId);
    });
  });

  describe('findAllByUser', () => {
    it('should return user posts filtered by community', async () => {
      const posts = [mockPost];
      const req = { user: mockUser };
      const communityId = 1;

      jest.spyOn(service, 'findAllByUser').mockResolvedValue(posts);

      const result = await controller.findAllByUser(req as any, communityId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Get posts successfully',
        data: posts,
      });
      expect(service.findAllByUser).toHaveBeenCalledWith(
        mockUser.id,
        communityId,
      );
    });
  });

  describe('findAllCommunity', () => {
    it('should return all communities', async () => {
      const communities = [mockCommunity];
      jest.spyOn(service, 'findAllCommunity').mockResolvedValue(communities);

      const result = await controller.findAllCommunity();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Get community successfully',
        data: communities,
      });
      expect(service.findAllCommunity).toHaveBeenCalled();
    });
  });

  describe('findByPost', () => {
    it('should return a post by id', async () => {
      const postId = '1';
      jest.spyOn(service, 'findByPost').mockResolvedValue(mockPost);

      const result = await controller.findByPost(postId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Get post successfully',
        data: mockPost,
      });
      expect(service.findByPost).toHaveBeenCalledWith(Number(postId));
    });
  });
});
