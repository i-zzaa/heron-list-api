import { PrismaClient } from '@prisma/client';
import createError from 'http-errors';
import bcrypt from 'bcryptjs';
import { signAccessToken } from '../utils/jwt';
import {
  ERROR_LOGIN_PASSWORD,
  ERROR_NOT_ACTIVE,
  ERROR_NOT_FOUND_USER,
} from '../utils/message.response';
import { UserProps } from './user.service';

const prisma = new PrismaClient();
export interface AuthProps {
  login: string;
  senha: string;
}

export async function loginService(params: AuthProps, device: string) {
  let filter = {};
  if (device === 'mobile') {
    filter = {
      perfil: {
        nome: {
          in: ['Terapeuta', 'Developer'],
        },
      },
    };
  }

  const user: UserProps = await prisma.usuario.findFirstOrThrow({
    select: {
      id: true,
      nome: true,
      login: true,
      senha: true,
      perfil: true,
      ativo: true,
      permissoes: {
        select: {
          permissao: {
            select: {
              cod: true,
            },
          },
        },
      },
    },
    where: {
      login: params.login,
      ...filter,
    },
  });

  if (!user) throw createError(404, ERROR_NOT_FOUND_USER);

  const checkPassword = bcrypt.compareSync(params.senha, user?.senha || '');
  if (!checkPassword) throw createError(404, ERROR_LOGIN_PASSWORD);

  if (!user.ativo) throw createError(401, ERROR_NOT_ACTIVE);

  const accessToken: Promise<string> | unknown = await signAccessToken(params);

  delete user.senha;

  const permissoesList: string[] = [];
  user.permissoes?.map(({ permissao }: any) => {
    permissoesList.push(permissao.cod);
  });

  user.permissoes = permissoesList;

  return {
    accessToken,
    user,
  };
}
