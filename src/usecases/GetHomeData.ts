import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { NotFoundError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

interface ConsistencyDay {
  workoutDayCompleted: boolean;
  workoutDayStarted: boolean;
}

export interface GetHomeDataInputDto {
  userId: string;
  date: string;
}

export interface GetHomeDataOutputDto {
  activeWorkoutPlanId: string;
  todayWorkoutDay?: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: string;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<string, ConsistencyDay>;
}

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export class GetHomeData {
  async execute(dto: GetHomeDataInputDto): Promise<GetHomeDataOutputDto> {
    const currentDate = dayjs.utc(dto.date, "YYYY-MM-DD");

    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
    });

    if (!activePlan) {
      throw new NotFoundError("Active workout plan not found");
    }

    const dayOfWeek = currentDate.day();
    const weekdayName = WEEKDAY_MAP[dayOfWeek];

    const todayWorkoutDay = await prisma.workoutDay.findFirst({
      where: {
        workoutPlanId: activePlan.id,
        weekday: weekdayName as never,
      },
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });

    const weekStart = currentDate.day(0).startOf("day");
    const weekEnd = currentDate.day(6).endOf("day");

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
            isActive: true,
          },
        },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate(),
        },
      },
    });

    const consistencyByDay: Record<string, ConsistencyDay> = {};

    for (let i = 0; i <= 6; i++) {
      const day = weekStart.add(i, "day").format("YYYY-MM-DD");
      consistencyByDay[day] = {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };
    }

    for (const session of sessions) {
      const sessionDate = dayjs.utc(session.startedAt).format("YYYY-MM-DD");
      if (consistencyByDay[sessionDate]) {
        consistencyByDay[sessionDate].workoutDayStarted = true;
        if (session.completedAt) {
          consistencyByDay[sessionDate].workoutDayCompleted = true;
        }
      }
    }

    const workoutStreak = this.calculateStreak(currentDate, activePlan.id);

    return {
      activeWorkoutPlanId: activePlan.id,
      todayWorkoutDay: todayWorkoutDay
        ? {
            workoutPlanId: activePlan.id,
            id: todayWorkoutDay.id,
            name: todayWorkoutDay.name,
            isRest: todayWorkoutDay.isRest,
            weekDay: todayWorkoutDay.weekday,
            estimatedDurationInSeconds:
              todayWorkoutDay.estimatedDurationInSeconds,
            coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
            exercisesCount: todayWorkoutDay._count.exercises,
          }
        : undefined,
      workoutStreak: await workoutStreak,
      consistencyByDay,
    };
  }

  private async calculateStreak(
    currentDate: dayjs.Dayjs,
    activePlanId: string,
  ): Promise<number> {
    const workoutDays = await prisma.workoutDay.findMany({
      where: { workoutPlanId: activePlanId },
      select: { id: true, weekday: true, isRest: true },
    });

    const weekdayToDay: Record<string, { id: string; isRest: boolean }> = {};
    for (const wd of workoutDays) {
      weekdayToDay[wd.weekday] = { id: wd.id, isRest: wd.isRest };
    }

    let streak = 0;
    let checkDate = currentDate;

    for (let i = 0; i < 365; i++) {
      const dayOfWeek = checkDate.day();
      const weekdayName = WEEKDAY_MAP[dayOfWeek];
      const planDay = weekdayToDay[weekdayName];

      if (!planDay) {
        break;
      }

      if (planDay.isRest) {
        streak++;
        checkDate = checkDate.subtract(1, "day");
        continue;
      }

      const dayStart = checkDate.startOf("day").toDate();
      const dayEnd = checkDate.endOf("day").toDate();

      const completedSession = await prisma.workoutSession.findFirst({
        where: {
          workoutDayId: planDay.id,
          completedAt: { not: null },
          startedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (!completedSession) {
        break;
      }

      streak++;
      checkDate = checkDate.subtract(1, "day");
    }

    return streak;
  }
}
