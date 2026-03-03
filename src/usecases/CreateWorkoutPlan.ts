import { NotFoundError } from "../erros/index.js";
import { Weekday } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

export interface CreateWorkoutPlanInputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekday: Weekday;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string | null;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export interface CreateWorkoutPlanOutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekday: Weekday;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string | null;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(
    dto: CreateWorkoutPlanInputDto,
  ): Promise<CreateWorkoutPlanOutputDto> {
    const existingworkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
    });
    return prisma.$transaction(async (tx) => {
      if (existingworkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingworkoutPlan.id },
          data: { isActive: false },
        });
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekday: workoutDay.weekday,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              coverImageUrl: workoutDay.coverImageUrl ?? null,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });

      const result = await tx.workoutPlan.findUnique({
        where: { id: workoutPlan.id },
        select: {
          id: true,
          name: true,
          workoutDays: {
            select: {
              name: true,
              weekday: true,
              isRest: true,
              estimatedDurationInSeconds: true,
              coverImageUrl: true,
              exercises: {
                select: {
                  order: true,
                  name: true,
                  sets: true,
                  reps: true,
                  restTimeInSeconds: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }

      return result;
    });
  }
}
