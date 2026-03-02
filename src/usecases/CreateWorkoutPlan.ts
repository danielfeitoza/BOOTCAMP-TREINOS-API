// DTO - Data Transfer Object
//Arquitetura Hexagonal
// Use Case vs service - Use Case é mais específico, tem um foco mais restrito, enquanto o
// service pode ser mais genérico e reutilizável. O Use Case é responsável por orquestrar
// a lógica de negócio específica para uma funcionalidade, enquanto o service pode conter
// lógica de negócio mais ampla e ser utilizado por vários Use Cases. O Use Case é mais
// orientado a ações específicas, enquanto o service é mais orientado a funcionalidades gerais.

import { includes } from "zod";

import { NotFoundError } from "../erros/index.js";
import { Weekday } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekday: Weekday;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto) {
    const existingworkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
    });
    // Transaction - é um recurso que garante que um conjunto de operações no banco de dados seja
    // executado de forma atômica, ou seja, todas as operações dentro da transação devem ser
    // concluídas com sucesso para que as alterações sejam aplicadas ao banco de dados. Se alguma
    // operação falhar, a transação é revertida, garantindo a integridade dos dados.
    // No código acima, a transação é usada para garantir que a desativação do plano de
    // treino existente e a criação do novo plano de treino sejam realizadas de forma atômica.
    // Se ocorrer algum erro durante a execução dessas operações, a transação será revertida,
    // evitando que o banco de dados fique em um estado inconsistente.
    //ACID - Atomicidade, Consistência, Isolamento e Durabilidade
    return prisma.$transaction(async (tx) => {
      if (existingworkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingworkoutPlan.id },
          data: { isActive: false },
        });
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekday: workoutDay.weekday,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });

      const result = await tx.workoutPlan.findUnique({
        where: { id: workoutPlan.id },
        include: {
          workoutDays: {
            include: {
              exercises: true,
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }

      return result;
    });
  }
}
