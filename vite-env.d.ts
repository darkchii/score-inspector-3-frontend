interface ImportMetaEnv {
    readonly VITE_API_BASE_URL_DEV: string;
    readonly VITE_API_BASE_URL: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.module.less' {
    const classes: { [key: string]: string };
    export default classes;
}