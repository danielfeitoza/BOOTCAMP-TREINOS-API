import { prisma } from "../lib/db.js";

export interface UpsertUserTimezoneInputDto {
  userId: string;
  timezone: string;
}

export interface UpsertUserTimezoneOutputDto {
  userId: string;
  timezone: string;
}

export class UpsertUserTimezone {
  async execute(
    dto: UpsertUserTimezoneInputDto,
  ): Promise<UpsertUserTimezoneOutputDto> {
    const user = await prisma.user.update({
      where: { id: dto.userId },
      data: {
        timezone: dto.timezone,
      },
      select: {
        id: true,
        timezone: true,
      },
    });

    return {
      userId: user.id,
      timezone: user.timezone!,
    };
  }
}
