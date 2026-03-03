import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface CompleteWorkoutSessionInputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string;
}

export interface CompleteWorkoutSessionOutputDto {
  id: string;
  completedAt: string;
  startedAt: string;
}

export class CompleteWorkoutSession {
  async execute(
    dto: CompleteWorkoutSessionInputDto,
  ): Promise<CompleteWorkoutSessionOutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: dto.sessionId, workoutDayId: dto.workoutDayId },
    });

    if (!workoutSession) {
      throw new NotFoundError("Workout session not found");
    }

    const updated = await prisma.workoutSession.update({
      where: { id: dto.sessionId },
      data: { completedAt: new Date(dto.completedAt) },
    });

    return {
      id: updated.id,
      completedAt: updated.completedAt!.toISOString(),
      startedAt: updated.startedAt.toISOString(),
    };
  }
}
