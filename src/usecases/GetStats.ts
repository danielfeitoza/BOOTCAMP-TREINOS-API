import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";

dayjs.extend(utc);

interface ConsistencyDay {
  workoutDayCompleted: boolean;
  workoutDayStarted: boolean;
}

export interface GetStatsInputDto {
  userId: string;
  from: string;
  to: string;
}

export interface GetStatsOutputDto {
  workoutStreak: number;
  consistencyByDay: Record<string, ConsistencyDay>;
  completedWorkoutsCount: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
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

export class GetStats {
  async execute(dto: GetStatsInputDto): Promise<GetStatsOutputDto> {
    const fromDate = dayjs.utc(dto.from, "YYYY-MM-DD").startOf("day");
    const toDate = dayjs.utc(dto.to, "YYYY-MM-DD").endOf("day");

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate(),
        },
      },
    });

    const consistencyByDay: Record<string, ConsistencyDay> = {};

    for (const session of sessions) {
      const sessionDate = dayjs.utc(session.startedAt).format("YYYY-MM-DD");

      if (!consistencyByDay[sessionDate]) {
        consistencyByDay[sessionDate] = {
          workoutDayCompleted: false,
          workoutDayStarted: false,
        };
      }

      consistencyByDay[sessionDate].workoutDayStarted = true;
      if (session.completedAt) {
        consistencyByDay[sessionDate].workoutDayCompleted = true;
      }
    }

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (session) => session.completedAt !== null,
    );
    const completedWorkoutsCount = completedSessions.length;

    const conclusionRate =
      totalSessions > 0 ? completedWorkoutsCount / totalSessions : 0;

    const totalTimeInSeconds = completedSessions.reduce((total, session) => {
      const start = dayjs.utc(session.startedAt);
      const end = dayjs.utc(session.completedAt!);
      return total + end.diff(start, "second");
    }, 0);

    const workoutStreak = await this.calculateStreak(dto.userId);

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
    });

    if (!activePlan) {
      return 0;
    }

    const workoutDays = await prisma.workoutDay.findMany({
      where: { workoutPlanId: activePlan.id },
      select: { id: true, weekday: true, isRest: true },
    });

    const weekdayToDay: Record<string, { id: string; isRest: boolean }> = {};
    for (const wd of workoutDays) {
      weekdayToDay[wd.weekday] = { id: wd.id, isRest: wd.isRest };
    }

    let streak = 0;
    let checkDate = dayjs.utc();

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
