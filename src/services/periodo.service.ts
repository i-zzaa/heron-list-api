import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PeriodoProps {
  id: number;
  nome: string;
}

export const getPeriodo = async () => {
  return await prisma.periodo.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const searchPeriodo = async (word: string) => {
  return await prisma.periodo.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      OR: [
        {
          nome: {
            contains: word,
          },
        },
      ],
    },
  });
};

export const createPeriodo = async (body: PeriodoProps) => {
  return await prisma.periodo.create({
    data: body,
  });
};

export const updatePeriodo = async (body: PeriodoProps, id: number) => {
  return await prisma.periodo.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};
