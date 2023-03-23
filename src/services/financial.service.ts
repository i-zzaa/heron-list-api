import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { especialidadeController } from '../controllers/especialidade.controller';
import {
  FinancialPaciente,
  FinancialPacienteProps,
  FinancialTerapeuta,
  FinancialTerapeutaProps,
} from '../model/financial.model';
import { formatDateTime, formaTime } from '../utils/convert-hours';
import {
  getFilterFinancialPaciente,
  getFilterFinancialTerapeuta,
} from './calendario.service';

interface FinancialProps {
  terapeutaId: number;
  pacienteId: number;
  datatFim: string;
  dataInicio: string;
}

export const getFinancialPaciente = async (body: FinancialProps) => {
  // filtra eventos por terapeuta no peridodo
  // filtra statusEventos cobrados
  // agrupa por paciente
  const { pacienteId, datatFim, dataInicio } = body;

  const eventos = await getFilterFinancialPaciente({
    pacienteId,
    datatFim,
    dataInicio,
  });

  if (!eventos.length)
    return {
      data: [],
      valorTotal: 0,
      paciente: '',
    };

  const relatorio: FinancialPacienteProps[] = [];
  let paciente;

  let valorTotal = 0;
  let valorKm = 0;
  let horas = moment.duration(0);
  const especialidadeTimeSessions: any = {};

  eventos.map((evento: any) => {
    const sessao = evento.paciente.vagaTerapia.especialidades.filter(
      (especialidade: any) =>
        especialidade.especialidadeId === evento.especialidade.id
    )[0];

    paciente = evento.paciente.nome;

    const start = formatDateTime(evento.start, evento.dataInicio);
    const end = formatDateTime(evento.end, evento.dataInicio);

    let diff = moment(end, 'YYYY-MM-DD HH:mm').diff(
      moment(start, 'YYYY-MM-DD HH:mm')
    );

    let duracaoTotal = moment.duration(
      especialidadeTimeSessions[evento.especialidade.nome] || 0
    );
    const duracaoEspecialidadeSessaoTotal = duracaoTotal.add(
      moment.duration(diff)
    );

    especialidadeTimeSessions[evento.especialidade.nome] = formaTime(
      duracaoEspecialidadeSessaoTotal
    );

    const financeiro = new FinancialPaciente({
      paciente: evento.paciente.nome,
      terapeuta: evento.terapeuta.usuario.nome,
      data: moment(evento.dataInicio).format('DD/MM/YYYY'),
      sessao: parseFloat(sessao.valor),
      km: sessao.km,
      status: evento.statusEventos.nome,
      valorSessao: parseFloat(sessao.valor),
      funcao: evento.funcao.nome,
      valorTotal: parseFloat(sessao.valor),
      horas: formaTime(moment.duration(diff)),
      especialidade: evento.especialidade.nome,
    });

    relatorio.push({ ...financeiro });

    valorTotal += parseFloat(sessao.valor);

    valorTotal += financeiro.valorTotal;
    horas = horas.add(financeiro.horas);

    return;
  });

  return {
    data: relatorio,
    nome: paciente,
    geral: {
      nome: paciente,
      valorTotal: valorTotal,
      horas: formaTime(horas),
      valorKm: valorKm,
      especialidadeSessoes: especialidadeTimeSessions,
    },
  };
};
export const getFinancial = async (body: FinancialProps) => {
  const { terapeutaId, datatFim, dataInicio } = body;

  const eventos = await getFilterFinancialTerapeuta({
    terapeutaId,
    datatFim,
    dataInicio,
  });

  // console.table(eventos);

  if (!eventos.length)
    return {
      data: [],
      valorTotal: 0,
      terapeuta: '',
    };

  const relatorio: FinancialTerapeutaProps[] = [];
  let terapeuta;
  let valorTotal = 0;
  let valorKm = 0;
  let horas = moment.duration(0);
  let especialidade = '';

  eventos.map((evento: any) => {
    const sessao = evento.paciente.vagaTerapia.especialidades.filter(
      (especialidade: any) =>
        especialidade.especialidadeId === evento.especialidade.id
    )[0];

    const comissao = evento.terapeuta.funcoes.filter(
      (funcao: any) => funcao.funcaoId === evento.funcao.id
    )[0];

    const sessaoValor = parseFloat(sessao.valor);
    const comissaoValor = parseFloat(comissao.comissao);

    const isDevolutiva = evento.modalidade.nome === 'Devolutiva';

    const start = formatDateTime(evento.start, evento.dataInicio);
    const end = formatDateTime(evento.end, evento.dataInicio);

    var diff = moment(end, 'YYYY-MM-DD HH:mm').diff(
      moment(start, 'YYYY-MM-DD HH:mm')
    );

    terapeuta = evento.terapeuta.usuario.nome;
    especialidade = evento.especialidade.nome;
    const financeiro = new FinancialTerapeuta({
      paciente: evento.paciente.nome,
      terapeuta: terapeuta,
      data: moment(evento.dataInicio).format('DD/MM/YYYY'),
      sessao: sessaoValor,
      km: evento.isExterno ? evento.km : 0,
      comissao: comissaoValor,
      tipo: comissao.tipo,
      status: evento.statusEventos.nome,
      devolutiva: isDevolutiva,
      horas: formaTime(moment.duration(diff)),
    });

    if (isDevolutiva) {
      financeiro.valorSessao = 50;
      financeiro.valorTotal = 50;

      valorTotal += financeiro.valorTotal;
      horas = horas.add(financeiro.horas);

      relatorio.push(financeiro);

      return;
    }

    const valorKmEvento = evento.isExterno ? evento.km * 0.9 : 0;
    let valorSessao = 0;

    switch (comissao.tipo.toLowerCase()) {
      case 'fixo':
        valorSessao = comissaoValor;
        break;
      default:
        valorSessao = sessaoValor * (comissaoValor / 100);
        break;
    }

    financeiro.valorKm = valorKmEvento;
    financeiro.valorSessao = valorSessao;
    financeiro.valorTotal = valorSessao + valorKmEvento;

    valorTotal += financeiro.valorTotal;
    valorKm += financeiro.valorKm;
    horas = horas.add(financeiro.horas);

    relatorio.push({ ...financeiro });

    return;
  });

  return {
    data: relatorio,
    nome: terapeuta,
    geral: {
      nome: terapeuta,
      valorTotal: valorTotal,
      horas: formaTime(horas),
      valorKm: valorKm,
      especialidade: especialidade,
    },
  };
};
