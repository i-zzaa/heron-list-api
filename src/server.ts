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
import { agendaController } from './controllers/agenda.controller';

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
    data: 'versão: 0.4.0-beta.50',
  });
});

app.post('/filtro/:type', auth, filterController.filter);

app.get('/dropdrown/:type', auth, filterController.dropdown);
app.get('/dropdrown/:type', auth, filterController.dropdown);
app.get('/dropdrown/:type', auth, filterController.dropdown);
app.get('/dropdrown/:type', auth, filterController.dropdown);
app.get('/dropdrown/:type', auth, filterController.dropdown);
app.get('/dropdrown/:type', auth, filterController.dropdown);

app.post('/login', authController.login);

// Paciente
app.get('/pacientes', auth, patientController.get);
app.post('/pacientes', auth, patientController.create);
app.put('/pacientes', auth, patientController.update);
app.put('/paciente/desabilitar', auth, patientController.disabled);
app.get('/pacientes/:search', auth, patientController.search);

app.put('/vagas/agendar', auth, vagaController.update);
app.get('/vagas/dashboard/:type', auth, vagaController.dashboard);
app.get('/vagas/wait', auth, vagaController.wait);
app.get('/vagas/return', auth, vagaController.returnTrend);
app.put('/vagas/devolutiva', auth, vagaController.updateReturn);

// Agenda
app.get('/agenda/mes/:current', auth, agendaController.getMes);
app.get('/agenda/dia/:current', auth, agendaController.getDia);
app.post('/agenda', auth, agendaController.create);

// Usuarios
app.get('/usuarios', auth, userController.get);
app.get('/usuarios/terapeutas', auth, userController.getTerapeuta);
app.get('/usuarios/:search', auth, userController.search);
app.post('/usuarios', userController.create);
app.put('/usuarios', auth, userController.update);
app.get('/usuarios/reset-senha/:id', auth, userController.updatePassword);
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

// const port = process.env.PORT || 3333;
app.listen(3333);
