import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: string) {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();

    const game = await this.prisma.game.create({
      data: {
        code,
        hostId: userId,
      },
    });

    return game;
  }
}
