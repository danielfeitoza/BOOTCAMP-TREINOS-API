import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { prisma } from "../lib/db.js";

dayjs.extend(utc);

export interface GetWatchActiveSessionInputDto {
  userId: string;
  date: string;
}

export type GetWatchActiveSessionOutputDto =
  | {
      active: false;
    }
  | {
      active: true;
      workoutPlanId: string;
      workoutDayId: string;
      workoutDayName: string;
      weekDay: string;
      isRest: boolean;
      exercises: Array<{
        id: string;
        name: string;
        order: number;
        sets: number;
        reps: number;
        restTimeInSeconds: number;
      }>;
    };

export class GetWatchActiveSession {
  async execute(
    dto: GetWatchActiveSessionInputDto,
  ): Promise<GetWatchActiveSessionOutputDto> {
    const dayStart = dayjs.utc(dto.date, "YYYY-MM-DD").startOf("day").toDate();
    const dayEnd = dayjs.utc(dto.date, "YYYY-MM-DD").endOf("day").toDate();

    const activeSession = await prisma.workoutSession.findFirst({
      where: {
        completedAt: null,
        startedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        workoutDay: {
          workoutPlan: {
            userId: dto.userId,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      include: {
        workoutDay: {
          select: {
            id: true,
            name: true,
            weekday: true,
            isRest: true,
            workoutPlanId: true,
            exercises: {
              select: {
                id: true,
                name: true,
                order: true,
                sets: true,
                reps: true,
                restTimeInSeconds: true,
              },
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!activeSession) {
      return { active: false };
    }

    return {
      active: true,
      workoutPlanId: activeSession.workoutDay.workoutPlanId,
      workoutDayId: activeSession.workoutDay.id,
      workoutDayName: activeSession.workoutDay.name,
      weekDay: activeSession.workoutDay.weekday,
      isRest: activeSession.workoutDay.isRest,
      exercises: activeSession.workoutDay.exercises,
    };
  }
}
