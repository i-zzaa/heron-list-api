import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FuncaoProps {
  id: number;
  nome: string;
  ativo: boolean;
  especialidadeId: number;
}

export const getFuncao = async () => {
  return await prisma.funcao.findMany({
    select: {
      id: true,
      nome: true,
      especialidade: true,
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

export const searchFuncao = async (word: string) => {
  return await prisma.funcao.findMany({
    select: {
      id: true,
      nome: true,
      especialidade: true,
      ativo: true,
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
        {
          especialidade: {
            nome: {
              contains: word,
            },
          },
        },
      ],
      ativo: true,
    },
  });
};

export const createFuncao = async (body: FuncaoProps) => {
  return await prisma.funcao.create({
    data: body,
  });
};

export const updateFuncao = async (body: FuncaoProps) => {
  return await prisma.funcao.update({
    data: {
      nome: body.nome,
      especialidadeId: body.especialidadeId,
    },
    where: {
      id: Number(body.id),
    },
  });
};

export const deleteFuncao = async (id: number) => {
  return await prisma.funcao.delete({
    where: {
      id: Number(id),
    },
  });
};
