import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

export interface GetWorkoutPlanInputDto {
  userId: string;
  workoutPlanId: string;
}

export interface GetWorkoutPlanOutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    id: string;
    weekDay: string;
    name: string;
    isRest: boolean;
    coverImageUrl?: string;
    estimatedDurationInSeconds: number;
    exercisesCount: number;
  }>;
}

export class GetWorkoutPlan {
  async execute(dto: GetWorkoutPlanInputDto): Promise<GetWorkoutPlanOutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
      select: {
        id: true,
        name: true,
        userId: true,
        workoutDays: {
          select: {
            id: true,
            weekday: true,
            name: true,
            isRest: true,
            coverImageUrl: true,
            estimatedDurationInSeconds: true,
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      workoutDays: workoutPlan.workoutDays.map((day) => ({
        id: day.id,
        weekDay: day.weekday,
        name: day.name,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl ?? undefined,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        exercisesCount: day._count.exercises,
      })),
    };
  }
}
