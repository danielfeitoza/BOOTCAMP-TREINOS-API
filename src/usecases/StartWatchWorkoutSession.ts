import { StartWorkoutSession } from "./StartWorkoutSession.js";
import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface StartWatchWorkoutSessionInputDto {
  deviceCode: string;
  workoutPlanId: string;
  workoutDayId: string;
}

export interface StartWatchWorkoutSessionOutputDto {
  userWorkoutSessionId: string;
  startedAt: string;
  completedAt: string | null;
}

export class StartWatchWorkoutSession {
  async execute(
    dto: StartWatchWorkoutSessionInputDto,
  ): Promise<StartWatchWorkoutSessionOutputDto> {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { deviceCode: dto.deviceCode },
      select: { userId: true },
    });

    if (!smartwatch) {
      throw new NotFoundError("Smartwatch not found");
    }

    const startWorkoutSession = new StartWorkoutSession();
    const result = await startWorkoutSession.execute({
      userId: smartwatch.userId,
      workoutPlanId: dto.workoutPlanId,
      workoutDayId: dto.workoutDayId,
    });

    return {
      ...result,
      completedAt: null,
    };
  }
}
