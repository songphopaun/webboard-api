import {
  Controller,
  Post,
  Body,
  HttpCode,
  Res,
  UnauthorizedException,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { standardResponse } from 'src/response.util';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: { username: string }, @Res() res: ExpressResponse) {
    const user = await this.usersService.findByUsername(body.username);

    if (!user) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'User not found',
        data: null,
      });
    }

    const accessToken = this.usersService.getAccessToken({
      id: user.id,
    });
    const refreshToken = this.usersService.getRefreshToken({
      id: user.id,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prd',
      sameSite: 'strict',
      path: '/users/refresh',
    });

    return res.json(
      standardResponse(200, 'Login successful', { accessToken, user }),
    );
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    try {
      const payload = this.usersService.verifyRefreshToken(refreshToken);
      const accessToken = this.usersService.getAccessToken({ id: payload.id });
      const newRefreshToken = this.usersService.getRefreshToken({
        id: payload.id,
      });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prd',
        sameSite: 'strict',
        path: '/users/refresh',
      });
      return res.json(
        standardResponse(200, 'refresh token successful', { accessToken }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
