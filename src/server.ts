import express from 'express';
import cors from 'cors';
import { auth } from './middlewares/auth';
import { authController } from './controllers/auth.controller';

import { userController } from './controllers/user.controller';
import { patientController } from './controllers/patient.controller';
import { tipoSessaoController } from './controllers/tipo-sessa.controller';
import { perfilController } from './controllers/perfil.controller';
import { especialidadeController } from './controllers/especialidade.controller';
import { convenioController } from './controllers/convenio.controller';
import { periodoController } from './controllers/periodo.controller';
import { filterController } from './controllers/filter.controller';
import { vagaController } from './controllers/vaga.controller';
import { permissaoController } from './controllers/permissao.controller';
import { funcaoController } from './controllers/funcao.controller';
import { localidadeController } from './controllers/localidade.controller';
import { statusEventosController } from './controllers/statusEventos.controller';
import { frequenciaController } from './controllers/frequencia.controller';
import { modalidadeController } from './controllers/modalidade.controller';
import { calendarioController } from './controllers/calendario.controller';
import { fiancialController } from './controllers/financial.controller';
const package_json = require('../package.json');

const app = express();

// var corsOptions = {
//   origin: [
//     'http://fbuots.hospedagemelastica.com.br/',
//     'http://multialcance.online',
//     'http://localhost:3000/',
//   ],
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

app.use(express.json());
// app.use(cors(corsOptions));
app.use(cors());

app.get('/', async (request, response) => {
  response.status(200).json({
    status: true,
    data: `versão backend ${package_json.version}`,
  });
});

app.post('/filtro/:type', auth, filterController.filter);

app.get('/dropdrown/:type', auth, filterController.dropdown);

app.post('/login', authController.login);

// Paciente
app.get('/pacientes', auth, patientController.get);
app.post('/pacientes', auth, patientController.create);
app.put('/pacientes', auth, patientController.update);
app.get('/pacientes/especialidades', auth, patientController.getEspecialidades);
app.put('/paciente/desabilitar', auth, patientController.disabled);

app.put('/vagas/agendar', auth, vagaController.update);
app.put(
  '/vagas/agendar/especialidade',
  auth,
  vagaController.updateEspecialidadeVaga
);
app.get('/vagas/dashboard/:type', auth, vagaController.dashboard);
app.get('/vagas/wait', auth, vagaController.wait);
app.get('/vagas/return', auth, vagaController.returnTrend);
app.put('/vagas/devolutiva', auth, vagaController.updateReturn);

// // Agenda
// app.get('/agenda/mes/:current', auth, agendaController.getMes);
// app.get('/agenda/dia/:current', auth, agendaController.getDia);
// app.post('/agenda', auth, agendaController.create);

// Usuarios
app.get('/usuarios', auth, userController.get);
app.get('/usuarios/terapeutas', auth, userController.getTerapeuta);
app.get('/usuarios/:search', auth, userController.search);
app.post('/usuarios', userController.create);
app.put('/usuarios', auth, userController.update);
app.get('/usuarios/reset-senha/:id', auth, userController.updatePassword);
app.put('/usuarios/reset-senha', auth, userController.updatePasswordCurrent);
app.put(
  '/usuarios/reset-senha/:login',
  auth,
  userController.updatePasswordLogin
);

// Tipo sessão
app.get('/tipo-sessao', auth, tipoSessaoController.get);
app.post('/tipo-sessao', auth, tipoSessaoController.create);
app.put('/tipo-sessao/:id', auth, tipoSessaoController.update);

// Perfil
app.get('/perfil', auth, perfilController.get);
app.post('/perfil', auth, perfilController.create);
app.put('/perfil/:id', auth, perfilController.update);

// Periodo
app.get('/periodo', auth, periodoController.get);
app.post('/periodo', auth, periodoController.create);
app.put('/periodo/:id', auth, periodoController.update);

// Convenio
app.get('/convenio', auth, convenioController.get);
app.post('/convenio', auth, convenioController.create);
app.put('/convenio/:id', auth, convenioController.update);

// Status
app.get('/status', auth, convenioController.get);
app.post('/status', auth, convenioController.create);
app.put('/status/:id', auth, convenioController.update);

// Especialidade
app.get('/especialidade', auth, especialidadeController.get);
app.post('/especialidade', auth, especialidadeController.create);
app.put('/especialidade/:id', auth, especialidadeController.update);

// Funcao
app.get('/funcao', auth, funcaoController.get);
app.post('/funcao', auth, funcaoController.create);
app.get('/funcao/:search', auth, funcaoController.search);
app.put('/funcao', auth, funcaoController.update);
app.delete('/funcao/:id', auth, funcaoController.delete);

// Especialidade
app.get('/localidade', auth, localidadeController.get);
app.post('/localidade', auth, localidadeController.create);
app.get('/localidade/:search', auth, localidadeController.search);
app.put('/localidade', auth, localidadeController.update);
app.delete('/localidade/:id', auth, localidadeController.delete);

//StatusEventos
app.get('/statusEventos', auth, statusEventosController.get);
app.post('/statusEventos', auth, statusEventosController.create);
app.get('/statusEventos/:search', auth, statusEventosController.search);
app.put('/statusEventos', auth, statusEventosController.update);
app.delete('/statusEventos/:id', auth, statusEventosController.delete);

//Frequencia
app.get('/frequencia', auth, frequenciaController.get);
app.post('/frequencia', auth, frequenciaController.create);
app.get('/frequencia/:search', auth, frequenciaController.search);
app.put('/frequencia', auth, frequenciaController.update);
app.delete('/frequencia/:id', auth, frequenciaController.delete);

//Modalidade
app.get('/modalidade', auth, modalidadeController.get);
app.post('/modalidade', auth, modalidadeController.create);
app.get('/modalidade/:search', auth, modalidadeController.search);
app.put('/modalidade', auth, modalidadeController.update);
app.delete('/modalidade/:id', auth, modalidadeController.delete);

//Permissao
app.get('/permissao', auth, permissaoController.get);
app.post('/permissao', auth, permissaoController.create);
app.get('/permissao/:search', auth, permissaoController.search);
app.put('/permissao', auth, permissaoController.update);

//Calendario
// app.get('/evento/mes/:mes/:ano', auth, calendarioController.getMonth);
app.get('/evento/filter/:start/:end', auth, calendarioController.getFilter);
app.get('/evento/:start/:end', auth, calendarioController.getRange);
app.post('/evento', auth, calendarioController.create);
app.put('/evento', auth, calendarioController.update);
app.delete('/evento/:groupId', auth, calendarioController.delete);

app.post('/filtro/financeiro/terapeuta', auth, fiancialController.getTerapeuta);
app.post('/filtro/financeiro/paciente', auth, fiancialController.getPaciente);

const PORT = process.env.PORT || 3333;
app.listen(PORT);
