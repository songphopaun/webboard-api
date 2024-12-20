import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const { title, content, communityId } = createPostDto;

    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const post = this.postRepository.create({
      title,
      content,
      community,
      user: { id: userId } as any,
    });

    return this.postRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['community'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (updatePostDto.communityId) {
      const community = await this.communityRepository.findOne({
        where: { id: updatePostDto.communityId },
      });
      if (!community) {
        throw new NotFoundException('Community not found');
      }
      post.community = community;
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.delete(id);
  }

  async findAll(communityId?: number): Promise<Post[]> {
    if (communityId) {
      return this.postRepository.find({
        where: { community: { id: communityId } },
        relations: ['community', 'user', 'comments'],
      });
    }

    return this.postRepository.find({
      relations: ['community', 'user', 'comments'],
    });
  }
}
