import moment from 'moment';
import momentBusinessDays from 'moment-business-days';

export const FERIADOS = [
  '01-01-2022',
  '21-04-2022',
  '01-05-2022',
  '16-06-2022',
  '07-09-2022',
  '12-10-2022',
  '02-11-2022',
  '15-11-2022',
  '25-12-2022',
];
momentBusinessDays.updateLocale('pt', {
  holidays: FERIADOS,
  holidayFormat: 'YYYY-MM-DD',
  workingWeekdays: [1, 2, 3, 4, 5, 6],
});

moment.locale('pt-BR');

export const momentBusiness = momentBusinessDays;

export const weekDay = [
  'Segunda-feira',
  'Terca-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];
export const formaTime = (duration: any) => {
  return `${duration.hours().toString().padStart(2, '0')}:${duration
    .minutes()
    .toString()
    .padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
};

export const formatDateTime = (hours: any, date: any) => {
  const arrTime = hours.split(':');
  return moment(date)
    .add(arrTime[0], 'hours')
    .add(arrTime[1], 'minutes')
    .format('YYYY-MM-DD HH:mm');
};

export const getPrimeiroDoMes = (ano: number, mes: number) => {
  return moment(new Date(ano, mes - 1, 1)).format('YYYY-MM-DD');
};

export const getUltimoDoMes = (ano: number, mes: number) => {
  return moment(new Date(ano, mes, 0)).format('YYYY-MM-DD');
};

export const getDiasDoMes = (ano: number, mes: number) => {
  const ultimoDia = moment(new Date(ano, mes, 0)).format('DD');

  const arrDatas = [];
  for (let index = 1; index <= parseInt(ultimoDia); index++) {
    const datCompleta = new Date(ano, mes, index);
    const isBusinessDay = moment(datCompleta, 'YYYY-MM-DD').isBusinessDay();

    if (isBusinessDay) {
      const format = moment(datCompleta).format('YYYY-MM-DD');
      arrDatas.push(format);
    }
  }

  return arrDatas;
};

export const formatadataPadraoBD = (date: any) => {
  const _date = new Date(date);
  return moment(_date).format('YYYY-MM-DD');
};

export const formatadataHora = (date: string, hora: string) => {
  const format = new Date(`${date}T${hora}`);
  return format;
};

export const formatdate = (date: any) => {
  const _date = new Date(date);
  const format = moment(_date).add(1, 'days');
  return moment(format).format('DD/MM/YYYY');
};

export const calculaIdade = (dataNascimento: Date) => {
  const idade = moment(dataNascimento, 'YYYYMMDD').fromNow();
  return idade.replace('há', '');
};

export const calculaData = (data1: any, data2: any) => {
  const dataAtual = moment(data1);
  const dataPassada = moment(data2);
  const diff = moment.duration(dataAtual.diff(dataPassada));

  return diff.asDays();
};

export const getFormat = (dias: number) => {
  if (!dias) return 0;

  const mes = Number((moment.duration(dias).asMonths() + 1).toFixed());
  const anos = Number((moment.duration(dias).asYears() + 1).toFixed());
  const quebraDias = dias % 30;
  const meses = dias % 365;

  let result = '';

  switch (true) {
    case dias < 30:
      return `${dias} dias`;
    case dias < 365:
      result = `${mes} mes(es)`;
      if (quebraDias !== 0) result = `${result} e ${quebraDias} dia(s)`;
      return result;
    case dias >= 365:
      result = `${anos} ano(s)`;

      if (meses !== 0) `${result} e ${meses} mes(es)`;
      if (quebraDias !== 0 && meses !== 0)
        result = `${result}, ${meses} mes(es) e ${quebraDias} dia(s)`;
      if (quebraDias !== 0 && mes === 0)
        result = `${result} e ${quebraDias} dia(s)`;
      return result;
  }
};

export function getDatesBetween(start: string, end: string) {
  // Defina a data de início e a data final como objetos moment
  const startDate = momentBusinessDays(start);
  const endDate = momentBusinessDays(end).add(1, 'days');

  // Obtenha todas as datas úteis entre a data de início e a data final usando o método businessDates

  const datasUteis = [];
  const diff = endDate.businessDiff(startDate);
  for (let index = 0; index <= diff; index++) {
    datasUteis.push(startDate.businessAdd(index).format('YYYY-MM-DD'));
  }

  // Imprima as datas úteis
  // console.log('Datas úteis:', datasUteis);
  return datasUteis;
}

export function getDates(
  diasDaSemana: string[],
  startDate: string,
  endDate: string,
  intervaloSemana: number = 1
) {
  // Crie uma matriz para armazenar as datas
  let datas: string[] = [];

  // console.log(startDate, endDate);
  // Defina a data de início e a data final como objetos moment
  const start = momentBusinessDays(startDate);
  const end = momentBusinessDays(endDate).nextBusinessDay();

  // Defina um objeto moment para a próxima ocorrência do dia da semana especificado após a data de início
  let dataAtual = start;

  // Itere enquanto a data atual for menor ou igual à data final
  while (dataAtual.isSameOrBefore(end)) {
    // Adicione a data atual à matriz de datas

    if (diasDaSemana.length) {
      let diasPercorridos = 0;
      diasDaSemana.map((day: string) => {
        if (parseInt(day) == dataAtual.day()) {
          datas.push(dataAtual.format('YYYY-MM-DD'));
          dataAtual.nextBusinessDay();
          diasPercorridos++;
        }
      });

      if (diasPercorridos > 1) dataAtual.businessSubtract(diasPercorridos);
    } else {
      datas.push(dataAtual.format('YYYY-MM-DD'));
    }

    switch (intervaloSemana) {
      case 1:
        dataAtual = dataAtual.businessAdd(5);
        break;
      case 2:
        dataAtual = dataAtual.businessAdd(10);
        break;
      case 3:
        dataAtual = dataAtual.businessAdd(15);
        break;
    }
  }

  // Retorne a matriz de datas
  return datas;
}

export function getDatesWhiteEvents(
  diasDaSemana: string[],
  startDate: string,
  endDate: string,
  intervaloSemana: number = 1,
  events: any
) {
  // Crie uma matriz para armazenar as datas
  let arrEvents: string[] = [];

  // console.log(startDate, endDate);
  // Defina a data de início e a data final como objetos moment
  const start = momentBusinessDays(startDate);
  const end = momentBusinessDays(endDate);

  // Defina um objeto moment para a próxima ocorrência do dia da semana especificado após a data de início
  let dataAtual = start;

  // Itere enquanto a data atual for menor ou igual à data final
  while (dataAtual.isSameOrBefore(end)) {
    // Adicione a data atual à matriz de datas

    const dataFim = moment(dataAtual).add(1, 'days').format('YYYY-MM-DD');
    const newEvents = {
      ...events,
      dataInicio: dataAtual.format('YYYY-MM-DD'),
      dataFim,
    };

    if (diasDaSemana.length) {
      let diasPercorridos = 0;
      diasDaSemana.map((day: string) => {
        if (parseInt(day) + 1 == dataAtual.day()) {
          arrEvents.push(newEvents);
          dataAtual.nextBusinessDay();
          diasPercorridos++;
        }
      });

      if (diasPercorridos > 1) dataAtual.businessSubtract(diasPercorridos);
    } else {
      arrEvents.push(newEvents);
    }

    switch (intervaloSemana) {
      case 1:
        dataAtual = dataAtual.businessAdd(5);
        break;
      case 2:
        dataAtual = dataAtual.businessAdd(10);
        break;
      case 3:
        dataAtual = dataAtual.businessAdd(15);
        break;
    }
  }

  // Retorne a matriz de datas
  return arrEvents;
}
