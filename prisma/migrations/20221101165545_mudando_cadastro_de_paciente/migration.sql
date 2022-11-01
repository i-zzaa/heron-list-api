-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "emAtendimento" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vaga" ALTER COLUMN "periodoId" DROP NOT NULL,
ALTER COLUMN "statusId" DROP NOT NULL;
