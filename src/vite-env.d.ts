/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_NAME?: string;
  // Add other env variables as needed, but remember they will be public
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
