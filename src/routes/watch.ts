import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  NotFoundError,
  WorkoutPlanNotActiveError,
  WorkoutSessionAlreadyStartedError,
} from "../erros/index.js";
import {
  CompleteWatchWorkoutSessionBodySchema,
  CompleteWatchWorkoutSessionParamsSchema,
  CompleteWorkoutSessionResponseSchema,
  ErrorSchema,
  StartWatchWorkoutSessionBodySchema,
  StartWorkoutSessionResponseSchema,
  WatchActiveSessionParamsSchema,
  WatchActiveSessionQuerySchema,
  WatchActiveSessionResponseSchema,
  WatchDeviceCodeQuerySchema,
  WatchTodayWorkoutParamsSchema,
  WatchTodayWorkoutResponseSchema,
} from "../schemas/index.js";
import { CompleteWatchWorkoutSession } from "../usecases/CompleteWatchWorkoutSession.js";
import { GetWatchActiveSession } from "../usecases/GetWatchActiveSession.js";
import { GetWatchTodayWorkout } from "../usecases/GetWatchTodayWorkout.js";
import { StartWatchWorkoutSession } from "../usecases/StartWatchWorkoutSession.js";

export const watchRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/sessions/active/:date",
    schema: {
      operationId: "getWatchActiveSession",
      tags: ["Watch"],
      summary: "Get active workout session for a user and date",
      params: WatchActiveSessionParamsSchema,
      querystring: WatchActiveSessionQuerySchema,
      response: {
        200: WatchActiveSessionResponseSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getWatchActiveSession = new GetWatchActiveSession();
        const result = await getWatchActiveSession.execute({
          userId: request.query.userId,
          date: request.params.date,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/today/:date",
    schema: {
      operationId: "getWatchTodayWorkout",
      tags: ["Watch"],
      summary: "Get active plan workout for a specific date using device code",
      params: WatchTodayWorkoutParamsSchema,
      querystring: WatchDeviceCodeQuerySchema,
      response: {
        200: WatchTodayWorkoutResponseSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const getWatchTodayWorkout = new GetWatchTodayWorkout();
        const result = await getWatchTodayWorkout.execute({
          deviceCode: request.query.deviceCode,
          date: request.params.date,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/sessions/start",
    schema: {
      operationId: "startWatchWorkoutSession",
      tags: ["Watch"],
      summary: "Start workout session using smartwatch device code",
      body: StartWatchWorkoutSessionBodySchema,
      response: {
        201: StartWorkoutSessionResponseSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        422: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const startWatchWorkoutSession = new StartWatchWorkoutSession();
        const result = await startWatchWorkoutSession.execute({
          deviceCode: request.body.deviceCode,
          workoutPlanId: request.body.workoutPlanId,
          workoutDayId: request.body.workoutDayId,
        });

        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }

        if (error instanceof WorkoutSessionAlreadyStartedError) {
          return reply.status(409).send({
            error: error.message,
            code: "WORKOUT_SESSION_ALREADY_STARTED",
          });
        }

        if (error instanceof WorkoutPlanNotActiveError) {
          return reply.status(422).send({
            error: error.message,
            code: "WORKOUT_PLAN_NOT_ACTIVE",
          });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/sessions/:sessionId/finish",
    schema: {
      operationId: "completeWatchWorkoutSession",
      tags: ["Watch"],
      summary: "Complete workout session using smartwatch device code",
      params: CompleteWatchWorkoutSessionParamsSchema,
      body: CompleteWatchWorkoutSessionBodySchema,
      response: {
        200: CompleteWorkoutSessionResponseSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const completeWatchWorkoutSession = new CompleteWatchWorkoutSession();
        const result = await completeWatchWorkoutSession.execute({
          deviceCode: request.body.deviceCode,
          workoutPlanId: request.body.workoutPlanId,
          workoutDayId: request.body.workoutDayId,
          sessionId: request.params.sessionId,
          completedAt: request.body.completedAt,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }

        return reply.status(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
