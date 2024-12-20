import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Community } from '../post/entities/community.entity';
import { Post } from '../post/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async seed() {
    await this.seedUsers();
    await this.seedCommunities();
    await this.seedPostsAndComments();
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const newUser = this.userRepository.create({
        username: 'admin',
        img: 'https://i.pravatar.cc/300',
      });

      await this.userRepository.save(newUser);
      console.log('User seeding completed!');
    } else {
      console.log('Users already seeded.');
    }
  }

  private async seedCommunities() {
    const communityCount = await this.communityRepository.count();
    if (communityCount === 0) {
      const communities = [
        { name: 'History' },
        { name: 'Food' },
        { name: 'Pets' },
        { name: 'Health' },
        { name: 'Fashion' },
        { name: 'Exercise' },
        { name: 'Others' },
      ];

      const communityEntities = this.communityRepository.create(communities);
      await this.communityRepository.save(communityEntities);

      console.log('Community seeding completed!');
    } else {
      console.log('Communities already seeded.');
    }
  }

  private async seedPostsAndComments() {
    const postCount = await this.postRepository.count();
    if (postCount > 0) {
      console.log('Posts and Comments already seeded.');
      return;
    }

    const user = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    const communities = await this.communityRepository.find();

    if (!user || communities.length === 0) {
      console.log(
        'Cannot seed Posts and Comments. Missing User or Communities.',
      );
      return;
    }

    const posts = [
      this.postRepository.create({
        title: 'The Great Wall of China',
        content:
          'A detailed discussion about the history of the Great Wall of China.',
        community: communities[0],
        user,
      }),
      this.postRepository.create({
        title: 'Healthy Recipes',
        content: 'Easy and healthy recipes for beginners.',
        community: communities[1],
        user,
      }),
    ];

    await this.postRepository.save(posts);
    console.log('Posts seeding completed!');

    const comments = [
      this.commentRepository.create({
        content: 'Great topic!',
        post: posts[0],
        user,
      }),
      this.commentRepository.create({
        content: 'Very informative. Thanks for sharing.',
        post: posts[0],
        user,
      }),
      this.commentRepository.create({
        content: 'I will try these recipes.',
        post: posts[1],
        user,
      }),
    ];

    await this.commentRepository.save(comments);
    console.log('Comments seeding completed!');
  }
}
