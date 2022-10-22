import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  const senha = bcrypt.hashSync('12345678', 8);

  await ['Developer', 'Administrador', 'Atendente'].map(async(perfil: string, index: number)=> {
    await prisma.perfil.upsert({
      where: { id: index },
      update: {},
      create: {
        nome: perfil,
      },
    });
  });

  await [{nome: 'Andressa Novaes Menezes', login: 'isa.menezes', perfilId: 1, senha: senha}, {nome: 'Samara Balbino Andreuci', login: 'samara.andreuci', perfilId: 2, senha: senha}].map(async(usuario: any, id: number)=> {
    await prisma.usuario.upsert({
      where: { id: id},
      update: {},
      create: {
        ...usuario
      },
    });
  });

  await ['Av Neuropsico', 'Av Psicodiag', 'Terapia ABA'].map(async(tipoSessao: string, id: number)=> {
    await prisma.tipoSessao.upsert({
      where: { id: id},
      update: {},
      create: {
       nome: tipoSessao
      },
    });
  });

  await ['Psico', 'Fono', 'TO', 'PsicoPEDAG'].map(async(especialidade: string, id: number)=> {
    await prisma.especialidade.upsert({
      where: { id: id},
      update: {},
      create: {
       nome: especialidade
      },
    });
  });

  await ['Integral', 'Manhã', 'Tarde'].map(async(periodo: string, id: number)=> {
    await prisma.periodo.upsert({
      where: { id: id},
      update: {},
      create: {
       nome: periodo
      },
    });
  });

  await ['Urgente', 'Padrão', 'Voltou ABA'].map(async(periodo: string, id: number)=> {
    await prisma.status.upsert({
      where: { id: id},
      update: {},
      create: {
       nome: periodo
      },
    });
  });

  await ['Unimed', 'Outros', 'Particular'].map(async(periodo: string, id: number)=> {
    await prisma.convenio.upsert({
      where: { id: id},
      update: {},
      create: {
       nome: periodo
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1);
  });