import z from "zod";

import { Weekday } from "../generated/prisma/enums.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const StartWorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
});

export const StartWorkoutSessionResponseSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

export const CompleteWorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
  sessionId: z.uuid(),
});

export const CompleteWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const CompleteWorkoutSessionResponseSchema = z.object({
  id: z.uuid(),
  completedAt: z.iso.datetime(),
  startedAt: z.iso.datetime(),
});

export const HomeParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

const ConsistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
});

export const HomeResponseSchema = z.object({
  activeWorkoutPlanId: z.uuid(),
  todayWorkoutDay: z.object({
    workoutPlanId: z.uuid(),
    id: z.uuid(),
    name: z.string(),
    isRest: z.boolean(),
    weekDay: z.string(),
    estimatedDurationInSeconds: z.number(),
    coverImageUrl: z.string().optional(),
    exercisesCount: z.number(),
  }),
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.string(), ConsistencyDaySchema),
});

export const GetWorkoutPlanParamsSchema = z.object({
  workoutPlanId: z.uuid(),
});

const WorkoutDaySummarySchema = z.object({
  id: z.uuid(),
  weekDay: z.string(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().optional(),
  estimatedDurationInSeconds: z.number(),
  exercisesCount: z.number(),
});

export const GetWorkoutPlanResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(WorkoutDaySummarySchema),
});

export const GetWorkoutDayParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
});

const ExerciseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  order: z.number(),
  workoutDayId: z.uuid(),
  sets: z.number(),
  reps: z.number(),
  restTimeInSeconds: z.number(),
});

const WorkoutSessionSummarySchema = z.object({
  id: z.uuid(),
  workoutDayId: z.uuid(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export const GetWorkoutDayResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().optional(),
  estimatedDurationInSeconds: z.number(),
  exercises: z.array(ExerciseSchema),
  weekDay: z.string(),
  sessions: z.array(WorkoutSessionSummarySchema),
});

export const ListWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

const ListWorkoutPlanExerciseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  order: z.number(),
  workoutDayId: z.uuid(),
  sets: z.number(),
  reps: z.number(),
  restTimeInSeconds: z.number(),
});

const ListWorkoutPlanDaySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  weekDay: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().nullable(),
  estimatedDurationInSeconds: z.number(),
  exercises: z.array(ListWorkoutPlanExerciseSchema),
});

export const ListWorkoutPlansResponseSchema = z.array(
  z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    workoutDays: z.array(ListWorkoutPlanDaySchema),
  }),
);

export const StatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

const StatsConsistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
});

export const StatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.string(), StatsConsistencyDaySchema),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekday: z.enum(Weekday),
      isRest: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      coverImageUrl: z.url().nullable().optional(),
      exercises: z.array(
        z.object({
          order: z.number().min(0),
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          restTimeInSeconds: z.number().min(1),
        }),
      ),
    }),
  ),
});
