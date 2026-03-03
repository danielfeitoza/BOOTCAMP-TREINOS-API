import { prisma } from "../lib/db.js";

interface ExerciseOutputDto {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
}

interface WorkoutDayOutputDto {
  id: string;
  name: string;
  weekDay: string;
  isRest: boolean;
  coverImageUrl: string | null;
  estimatedDurationInSeconds: number;
  exercises: ExerciseOutputDto[];
}

interface WorkoutPlanOutputDto {
  id: string;
  name: string;
  isActive: boolean;
  workoutDays: WorkoutDayOutputDto[];
}

export interface ListWorkoutPlansInputDto {
  userId: string;
  active?: boolean;
}

export type ListWorkoutPlansOutputDto = WorkoutPlanOutputDto[];

export class ListWorkoutPlans {
  async execute(
    dto: ListWorkoutPlansInputDto,
  ): Promise<ListWorkoutPlansOutputDto> {
    const plans = await prisma.workoutPlan.findMany({
      where: {
        userId: dto.userId,
        ...(dto.active !== undefined ? { isActive: dto.active } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        isActive: true,
        workoutDays: {
          select: {
            id: true,
            name: true,
            weekday: true,
            isRest: true,
            coverImageUrl: true,
            estimatedDurationInSeconds: true,
            exercises: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                name: true,
                order: true,
                workoutDayId: true,
                sets: true,
                reps: true,
                restTimeInSeconds: true,
              },
            },
          },
        },
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      isActive: plan.isActive,
      workoutDays: plan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        weekDay: day.weekday,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        exercises: day.exercises,
      })),
    }));
  }
}
