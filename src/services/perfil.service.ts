import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PerfilProps {
  id: number;
  nome: string;
}

export const getPerfil = async () => {
  return await prisma.perfil.findMany({
    select: {
      id: true,
      nome: true,
    },
    orderBy: {
      nome: 'asc',
    },
    where: {
      NOT: {
        nome: 'Developer',
      },
    },
  });
};

export const searchPerfil = async (word: string) => {
  return await prisma.perfil.findMany({
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
      NOT: {
        nome: 'Developer',
      },
    },
  });
};

export const createPerfil = async (body: PerfilProps) => {
  return await prisma.perfil.create({
    data: body,
  });
};

export const updatePerfil = async (body: PerfilProps, id: number) => {
  return await prisma.perfil.update({
    data: {
      nome: body.nome,
    },
    where: {
      id: Number(id),
    },
  });
};
