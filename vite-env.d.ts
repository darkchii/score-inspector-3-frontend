/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL_DEV: string;
    readonly VITE_API_BASE_URL: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    glob: <T = unknown>(
        pattern: string,
        options?: {
            eager?: boolean;
            import?: string;
            query?: string | Record<string, string | number | boolean>;
        }
    ) => Record<string, T>;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.module.less' {
    const classes: { [key: string]: string };
    export default classes;
}