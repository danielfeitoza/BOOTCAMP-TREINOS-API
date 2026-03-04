import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError } from "../erros/index.js";
import { authMiddleware } from "../lib/auth-middleware.js";
import {
  ErrorSchema,
  HomeParamsSchema,
  HomeResponseSchema,
} from "../schemas/index.js";
import { GetHomeData } from "../usecases/GetHomeData.js";

export const homeRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:date",
    schema: {
      tags: ["Home"],
      summary: "Get home page data for the authenticated user",
      params: HomeParamsSchema,
      response: {
        200: HomeResponseSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const getHomeData = new GetHomeData();
        const result = await getHomeData.execute({
          userId: request.session.user.id,
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
};
