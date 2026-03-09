import { CompleteWorkoutSession } from "./CompleteWorkoutSession.js";
import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface CompleteWatchWorkoutSessionInputDto {
  deviceCode: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

export interface CompleteWatchWorkoutSessionOutputDto {
  id: string;
  completedAt: string;
  startedAt: string;
}

export class CompleteWatchWorkoutSession {
  async execute(
    dto: CompleteWatchWorkoutSessionInputDto,
  ): Promise<CompleteWatchWorkoutSessionOutputDto> {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { deviceCode: dto.deviceCode },
      select: { userId: true },
    });

    if (!smartwatch) {
      throw new NotFoundError("Smartwatch not found");
    }

    const completeWorkoutSession = new CompleteWorkoutSession();
    return completeWorkoutSession.execute({
      userId: smartwatch.userId,
      workoutPlanId: dto.workoutPlanId,
      workoutDayId: dto.workoutDayId,
      sessionId: dto.sessionId,
      completedAt: dto.completedAt,
    });
  }
}
