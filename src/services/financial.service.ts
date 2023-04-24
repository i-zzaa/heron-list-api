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

  await Promise.all(
    eventos.map((evento: any) => {
      const exdate = evento?.exdate ? evento.exdate.split(',') : [];

      if (exdate.includes(evento.dataInicio)) {
        return;
      }

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

      especialidadeTimeSessions[evento.especialidade.nome] =
        evento.statusEventos.cobrar &&
        formaTime(duracaoEspecialidadeSessaoTotal);

      const financeiro = new FinancialPaciente({
        paciente: evento.paciente.nome,
        terapeuta: evento.terapeuta.usuario.nome,
        data: moment(evento.dataInicio).format('DD/MM/YYYY'),
        sessao: evento.statusEventos.cobrar ? parseFloat(sessao.valor) : 0,
        km: sessao.km,
        status: evento.statusEventos.nome,
        valorSessao: evento.statusEventos.cobrar ? parseFloat(sessao.valor) : 0,
        funcao: evento.funcao.nome,
        valorTotal: evento.statusEventos.cobrar ? parseFloat(sessao.valor) : 0,
        horas: formaTime(moment.duration(diff)),
        especialidade: evento.especialidade.nome,
      });

      if (!evento.statusEventos.cobrar) {
        relatorio.push(financeiro);
        return;
      }

      relatorio.push({ ...financeiro });

      // valorTotal += parseFloat(sessao.valor);

      valorTotal += financeiro.valorTotal;
      horas = horas.add(financeiro.horas);

      return;
    })
  );

  const terapeutasAgrupados: any = {};
  await Promise.all(
    relatorio.map((item: FinancialPacienteProps) => {
      if (!terapeutasAgrupados[item.terapeuta]) {
        terapeutasAgrupados[item.terapeuta] = [];
      }
      terapeutasAgrupados[item.terapeuta].push(item);
    })
  );

  return {
    data: terapeutasAgrupados,
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
export const getFinancial_backup = async (body: FinancialProps) => {
  const { terapeutaId, datatFim, dataInicio } = body;

  // console.log(body);

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

  await Promise.all(
    eventos.map((evento: any) => {
      const exdate = evento?.exdate ? evento.exdate.split(',') : [];
      if (exdate.includes(evento.dataInicio)) {
        return;
      }

      let sessao = [];
      switch (evento.modalidade.nome) {
        case 'Avaliação':
        case 'Devolutiva':
          sessao = evento.paciente.vaga.especialidades.filter(
            (especialidadePaciente: any) =>
              especialidadePaciente.especialidadeId === evento.especialidade.id
          )[0];
          break;

        default:
          sessao = evento.paciente.vagaTerapia.especialidades.filter(
            (especialidadePaciente: any) =>
              especialidadePaciente.especialidadeId === evento.especialidade.id
          )[0];
          break;
      }

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
        km: Number(evento.km),
        comissao: comissaoValor,
        tipo: comissao.tipo,
        status: evento.statusEventos.nome,
        devolutiva: isDevolutiva,
        horas: formaTime(moment.duration(diff)),
      });

      if (!evento.statusEventos.cobrar) {
        financeiro.comissao = 0;
        financeiro.valorSessao = 0;
        financeiro.valorTotal = 0;
        financeiro.km = 0;

        relatorio.push(financeiro);
        return;
      }

      if (isDevolutiva) {
        financeiro.valorSessao = 50;
        financeiro.valorTotal = 50;

        valorTotal += financeiro.valorTotal;
        horas = horas.add(financeiro.horas);

        relatorio.push(financeiro);

        return;
      }

      const valorKmEvento = Number(evento.km) * 0.9;
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
    })
  );

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

  await Promise.all(
    eventos.map((evento: any) => {
      const exdate = evento?.exdate ? evento.exdate.split(',') : [];
      if (exdate.includes(evento.dataInicio)) {
        return;
      }

      let sessao = [];
      switch (evento.modalidade.nome) {
        case 'Avaliação':
        case 'Devolutiva':
          sessao = evento.paciente.vaga.especialidades.filter(
            (especialidadePaciente: any) =>
              especialidadePaciente.especialidadeId === evento.especialidade.id
          )[0];
          break;

        default:
          sessao = evento.paciente.vagaTerapia.especialidades.filter(
            (especialidadePaciente: any) =>
              especialidadePaciente.especialidadeId === evento.especialidade.id
          )[0];
          break;
      }

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
        km: Number(evento.km),
        comissao: comissaoValor,
        tipo: comissao.tipo,
        status: evento.statusEventos.nome,
        devolutiva: isDevolutiva,
        horas: formaTime(moment.duration(diff)),
      });

      if (!evento.statusEventos.cobrar) {
        financeiro.comissao = 0;
        financeiro.valorSessao = 0;
        financeiro.valorTotal = 0;
        financeiro.km = 0;

        relatorio.push(financeiro);
        return;
      }

      if (isDevolutiva) {
        financeiro.valorSessao = 50;
        financeiro.valorTotal = 50;

        valorTotal += financeiro.valorTotal;
        horas = horas.add(financeiro.horas);

        relatorio.push(financeiro);

        return;
      }

      const valorKmEvento = Number(evento.km) * 0.9;
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
    })
  );

  const pacientesAgrupados: any = {};
  await Promise.all(
    relatorio.map((item: FinancialTerapeutaProps) => {
      if (!pacientesAgrupados[item.paciente]) {
        pacientesAgrupados[item.paciente] = [];
      }
      pacientesAgrupados[item.paciente].push(item);
    })
  );

  return {
    data: pacientesAgrupados,
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
