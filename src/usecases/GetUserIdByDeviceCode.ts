import { prisma } from "../lib/db.js";

export interface GetUserIdByDeviceCodeInputDto {
  deviceCode: string;
}

export interface GetUserIdByDeviceCodeOutputDto {
  userId: string | 0;
}

export class GetUserIdByDeviceCode {
  async execute(
    dto: GetUserIdByDeviceCodeInputDto,
  ): Promise<GetUserIdByDeviceCodeOutputDto> {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { deviceCode: dto.deviceCode },
      select: { userId: true },
    });

    if (!smartwatch) {
      return { userId: 0 };
    }

    return { userId: smartwatch.userId };
  }
}
