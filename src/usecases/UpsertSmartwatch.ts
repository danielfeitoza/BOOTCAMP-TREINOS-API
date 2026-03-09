import { SmartwatchDeviceCodeInUseError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface UpsertSmartwatchInputDto {
  userId: string;
  deviceCode: string;
  deviceName: string;
}

export interface UpsertSmartwatchOutputDto {
  id: string;
  userId: string;
  deviceCode: string;
  deviceName: string;
}

export class UpsertSmartwatch {
  async execute(
    dto: UpsertSmartwatchInputDto,
  ): Promise<UpsertSmartwatchOutputDto> {
    const existingByDeviceCode = await prisma.smartwatch.findUnique({
      where: { deviceCode: dto.deviceCode },
      select: { userId: true },
    });

    if (existingByDeviceCode && existingByDeviceCode.userId !== dto.userId) {
      throw new SmartwatchDeviceCodeInUseError();
    }

    const smartwatch = await prisma.smartwatch.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        deviceCode: dto.deviceCode,
        deviceName: dto.deviceName,
      },
      update: {
        deviceCode: dto.deviceCode,
        deviceName: dto.deviceName,
      },
      select: {
        id: true,
        userId: true,
        deviceCode: true,
        deviceName: true,
      },
    });

    return smartwatch;
  }
}
