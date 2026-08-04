import Config from '../data/Config.json';
import type { IConfig } from '../types/types';
const typedConfig: IConfig = Config;

function GetApiMode() : string {
    return typedConfig.DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION';
}

export function GetAPI() : string {
    return typedConfig.API[GetApiMode()].API_URL;
}

export function GetOsuClientID() : number {
    return typedConfig.API[GetApiMode()].OSU_CLIENT_ID;
}

export function GetOsuApiRedirect() : string {
    return typedConfig.API[GetApiMode()].AUTH_REDIRECT;
}

export function GetOsuAuthUrl() : string {
    return `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${GetOsuClientID()}&scope=identify%20public&redirect_uri=${GetOsuApiRedirect()}`;
}
