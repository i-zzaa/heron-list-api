-- CreateTable
CREATE TABLE "Permissao" (
    "id" SERIAL NOT NULL,
    "cod" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioOnPermissao" (
    "permissaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioOnPermissao_pkey" PRIMARY KEY ("permissaoId","usuarioId")
);
