node
typescript
prisma - ORM (relaciona as tabelas do BD com as classes do back )
sqlite
pesquisar: Zod js para validacao

# Entity

### Paciente
id
Nome
Responsavel
Telefone
Data de nascimento
Convenio (Unimed | Outros)
createAt

### Vaga (Fila)
Data do contato
Status (Urgente | Padrao | voltou ABA) [unico]
Especialidade (Psico | Fono | TO | PsicoPEDAG) [multi]
Tipo de sessao (Av Neuropsico | Av Psicodiag | Terapia ABA)
Perido (Integral | Manha | Tarde)
Observacao
createAt

### User
id
Nome
login
senha
perfil
createAt

### Tipo de sessao
id
nome

### Perfil
id
nome

### Periodo
id
nome

### Especialidade
id
nome

### Status
id
nome


# Casos de uso

### USER
- Criar user
- Edtar user
- Deletar user
- Atualizar user
- Listar User


- Listagem de Paciente
- Criacao de Paciente
- Criacao da Vaga

- Criacao de User
- Edicao de User
