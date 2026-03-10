import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export interface GetWatchTodayWorkoutInputDto {
  deviceCode: string;
  date: string;
}

export interface GetWatchTodayWorkoutOutputDto {
  workoutPlanId: string;
  workoutDayId: string;
  workoutDayName: string;
  weekDay: string;
  isRest: boolean;
  completedAt: string | null;
  exercises: Array<{
    id: string;
    name: string;
    order: number;
    sets: number;
    reps: number;
    restTimeInSeconds: number;
  }>;
}

export class GetWatchTodayWorkout {
  async execute(
    dto: GetWatchTodayWorkoutInputDto,
  ): Promise<GetWatchTodayWorkoutOutputDto> {
    const smartwatch = await prisma.smartwatch.findUnique({
      where: { deviceCode: dto.deviceCode },
      select: { userId: true },
    });

    if (!smartwatch) {
      throw new NotFoundError("Smartwatch not found");
    }

    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: smartwatch.userId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!activePlan) {
      throw new NotFoundError("Active workout plan not found");
    }

    const dayOfWeek = dayjs.utc(dto.date, "YYYY-MM-DD").day();
    const weekdayName = WEEKDAY_MAP[dayOfWeek];

    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        workoutPlanId: activePlan.id,
        weekday: weekdayName as never,
      },
      include: {
        exercises: {
          select: {
            id: true,
            name: true,
            order: true,
            sets: true,
            reps: true,
            restTimeInSeconds: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const dayStart = dayjs.utc(dto.date, "YYYY-MM-DD").startOf("day").toDate();
    const dayEnd = dayjs.utc(dto.date, "YYYY-MM-DD").endOf("day").toDate();

    const workoutSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId: workoutDay.id,
        startedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        completedAt: true,
      },
    });

    return {
      workoutPlanId: activePlan.id,
      workoutDayId: workoutDay.id,
      workoutDayName: workoutDay.name,
      weekDay: workoutDay.weekday,
      isRest: workoutDay.isRest,
      completedAt: workoutSession?.completedAt?.toISOString() ?? null,
      exercises: workoutDay.exercises,
    };
  }
}
