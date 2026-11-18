/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_DEFAULT_COUNTRY: string;
  readonly VITE_DEFAULT_CURRENCY: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_GOOGLE_MAPS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
