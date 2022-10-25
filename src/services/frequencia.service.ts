import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FrequenciaProps {
  id: number;
  nome: string;
  ativo: boolean;
}

export const getFrequencia = async () => {
  return await prisma.frequencia.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
    },
  });
};

export const searchFrequencia = async (word: string) => {
  return await prisma.frequencia.findMany({
    select: {
      id: true,
      nome: true,
      ativo: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      ativo: true,
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

export const createFrequencia = async (body: FrequenciaProps) => {
  return await prisma.frequencia.create({
    data: body,
  });
};

export const updateFrequencia = async (body: FrequenciaProps) => {
  return await prisma.frequencia.update({
    data: {
      nome: body.nome,
      ativo: body.ativo,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteFrequencia = async (id: number) => {
  return await prisma.frequencia.delete({
    where: {
      id: Number(id),
    },
  });
};
