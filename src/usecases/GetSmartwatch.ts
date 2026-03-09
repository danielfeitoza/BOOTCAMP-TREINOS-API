import { prisma } from "../lib/db.js";

export interface GetSmartwatchOutputDto {
  id: string;
  userId: string;
  deviceCode: string;
  deviceName: string;
}

export class GetSmartwatch {
  async execute(userId: string): Promise<GetSmartwatchOutputDto | null> {
    return prisma.smartwatch.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        deviceCode: true,
        deviceName: true,
      },
    });
  }
}
