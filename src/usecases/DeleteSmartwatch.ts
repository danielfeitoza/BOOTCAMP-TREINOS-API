import { SmartwatchNotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface DeleteSmartwatchOutputDto {
  id: string;
  userId: string;
}

export class DeleteSmartwatch {
  async execute(userId: string): Promise<DeleteSmartwatchOutputDto> {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });

    if (!smartwatch) {
      throw new SmartwatchNotFoundError();
    }

    await prisma.smartwatch.delete({
      where: { userId },
    });

    return smartwatch;
  }
}
