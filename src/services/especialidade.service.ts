import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EspecialidadeProps {
  id: number;
  nome: string;
}

export const getEspecialidade = async () => {
  return await prisma.especialidade.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });
};

export const searchEspecialidade = async (word: string) => {
  return await prisma.especialidade.findMany({
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

export const createEspecialidade = async (body: EspecialidadeProps) => {
  return await prisma.especialidade.create({
    data: body,
  });
};

export const updateEspecialidade = async (
  body: EspecialidadeProps,
  id: number
) => {
  return await prisma.especialidade.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};
