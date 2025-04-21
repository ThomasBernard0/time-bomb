import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: string, name: string) {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const game = await this.prisma.game.create({
      data: {
        code,
        host: {
          connect: { id: userId },
        },
        status: 'WAITING',
      },
    });
    await this.prisma.player.create({
      data: {
        userId,
        name,
        gameId: game.id,
      },
    });
    return { code: game.code };
  }

  async verifyGameCode(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code: code },
    });
    return game;
  }

  async getPlayersInGame(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!game) {
      throw new NotFoundException('Partie introuvable.');
    }
    return game.players;
  }

  async joinGame(code: string, userId: string, name: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
    });

    if (!game) {
      throw new NotFoundException('Partie introuvable.');
    }

    const existing = await this.prisma.player.findFirst({
      where: {
        userId,
        gameId: game.id,
      },
    });

    if (existing) {
      throw new ConflictException('Vous êtes déjà dans la partie.');
    }

    await this.prisma.player.create({
      data: {
        userId,
        name,
        gameId: game.id,
      },
    });

    return { code: game.code };
  }
}
