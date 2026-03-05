import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { authMiddleware } from "../lib/auth-middleware.js";
import {
  ErrorSchema,
  StatsQuerySchema,
  StatsResponseSchema,
} from "../schemas/index.js";
import { GetStats } from "../usecases/GetStats.js";

export const statsRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getStats",
      tags: ["Stats"],
      summary: "Get workout statistics for a date range",
      querystring: StatsQuerySchema,
      response: {
        200: StatsResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const getStats = new GetStats();
        const result = await getStats.execute({
          userId: request.session.user.id,
          from: request.query.from,
          to: request.query.to,
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
};
