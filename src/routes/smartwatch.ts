import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  SmartwatchDeviceCodeInUseError,
  SmartwatchNotFoundError,
} from "../erros/index.js";
import { authMiddleware } from "../lib/auth-middleware.js";
import {
  DeleteSmartwatchResponseSchema,
  ErrorSchema,
  SmartwatchResponseSchema,
  UpsertSmartwatchBodySchema,
} from "../schemas/index.js";
import { DeleteSmartwatch } from "../usecases/DeleteSmartwatch.js";
import { GetSmartwatch } from "../usecases/GetSmartwatch.js";
import { UpsertSmartwatch } from "../usecases/UpsertSmartwatch.js";

export const smartwatchRouter = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/pair",
    schema: {
      operationId: "pairSmartwatch",
      tags: ["Smartwatch"],
      summary: "Create or update smartwatch pairing for the authenticated user",
      body: UpsertSmartwatchBodySchema,
      response: {
        200: SmartwatchResponseSchema,
        401: ErrorSchema,
        409: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const upsertSmartwatch = new UpsertSmartwatch();
        const result = await upsertSmartwatch.execute({
          userId: request.session.user.id,
          deviceCode: request.body.deviceCode,
          deviceName: request.body.deviceName,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof SmartwatchDeviceCodeInUseError) {
          return reply.status(409).send({
            error: error.message,
            code: "SMARTWATCH_DEVICE_CODE_IN_USE",
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
    method: "GET",
    url: "/",
    schema: {
      operationId: "getSmartwatch",
      tags: ["Smartwatch"],
      summary: "Get smartwatch pairing for the authenticated user",
      response: {
        200: SmartwatchResponseSchema.nullable(),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const getSmartwatch = new GetSmartwatch();
        const result = await getSmartwatch.execute(request.session.user.id);

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
    method: "DELETE",
    url: "/",
    schema: {
      operationId: "deleteSmartwatch",
      tags: ["Smartwatch"],
      summary: "Delete smartwatch pairing for the authenticated user",
      response: {
        200: DeleteSmartwatchResponseSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authMiddleware,
    handler: async (request, reply) => {
      try {
        const deleteSmartwatch = new DeleteSmartwatch();
        const result = await deleteSmartwatch.execute(request.session.user.id);

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof SmartwatchNotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "SMARTWATCH_NOT_FOUND",
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
