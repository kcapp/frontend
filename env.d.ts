/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KCAPP_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
