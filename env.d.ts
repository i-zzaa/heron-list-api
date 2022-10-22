/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly VITE_ACCESS_TOKEN_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
