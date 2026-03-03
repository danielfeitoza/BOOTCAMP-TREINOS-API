import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

export interface GetWorkoutDayInputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
}

interface ExerciseDto {
  id: string;
  name: string;
  order: number;
  workoutDayId: string;
  sets: number;
  reps: number;
  restTimeInSeconds: number;
}

interface SessionDto {
  id: string;
  workoutDayId: string;
  startedAt?: string;
  completedAt?: string;
}

export interface GetWorkoutDayOutputDto {
  id: string;
  name: string;
  isRest: boolean;
  coverImageUrl?: string;
  estimatedDurationInSeconds: number;
  exercises: ExerciseDto[];
  weekDay: string;
  sessions: SessionDto[];
}

export class GetWorkoutDay {
  async execute(dto: GetWorkoutDayInputDto): Promise<GetWorkoutDayOutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
      include: {
        exercises: {
          select: {
            id: true,
            name: true,
            order: true,
            workoutDayId: true,
            sets: true,
            reps: true,
            restTimeInSeconds: true,
          },
          orderBy: { order: "asc" },
        },
        sessions: {
          select: {
            id: true,
            workoutDayId: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      isRest: workoutDay.isRest,
      coverImageUrl: workoutDay.coverImageUrl ?? undefined,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      weekDay: workoutDay.weekday,
      exercises: workoutDay.exercises,
      sessions: workoutDay.sessions.map((session) => ({
        id: session.id,
        workoutDayId: session.workoutDayId,
        startedAt: dayjs.utc(session.startedAt).format("YYYY-MM-DD"),
        completedAt: session.completedAt
          ? dayjs.utc(session.completedAt).format("YYYY-MM-DD")
          : undefined,
      })),
    };
  }
}
