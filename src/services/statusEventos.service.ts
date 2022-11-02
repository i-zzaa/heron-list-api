import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusEventosProps {
  id: number;
  nome: string;
  ativo: boolean;
}

export const getStatusEventos = async () => {
  return await prisma.statusEventos.findMany({
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

export const searchStatusEventos = async (word: string) => {
  return await prisma.statusEventos.findMany({
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

export const createStatusEventos = async (body: StatusEventosProps) => {
  return await prisma.statusEventos.create({
    data: body,
  });
};

export const updateStatusEventos = async (body: StatusEventosProps) => {
  return await prisma.statusEventos.update({
    data: {
      nome: body.nome,
      ativo: body.ativo,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteStatusEventos = async (id: number) => {
  return await prisma.statusEventos.delete({
    where: {
      id: Number(id),
    },
  });
};

export const getStatusUnique = async (id: number) => {
  return await prisma.statusEventos.findUniqueOrThrow({
    select: {
      nome: true,
      id: true,
    },
    where: {
      id: Number(id),
    },
  });
};
