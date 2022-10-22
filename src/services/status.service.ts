import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusProps {
  id: number;
  nome: string;
}

export const getStatus = async () => {
  return await prisma.status.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const searchStatus = async (word: string) => {
  return await prisma.status.findMany({
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

export const createStatus = async (body: StatusProps) => {
  return await prisma.status.create({
    data: body,
  });
};

export const updateStatus = async (body: StatusProps, id: number) => {
  return await prisma.status.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};
