import Config from '../data/Config.json';

function GetApiMode() : string {
    return Config.DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION';
}

export function GetAPI() : string {
    return Config.API[GetApiMode()].API_URL;
}

export function GetOsuClientID() : string {
    return Config.API[GetApiMode()].OSU_CLIENT_ID;
}

export function GetOsuApiRedirect() : string {
    return Config.API[GetApiMode()].AUTH_REDIRECT;
}

export function GetOsuAuthUrl() : string {
    return `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${GetOsuClientID()}&scope=identify%20public&redirect_uri=${GetOsuApiRedirect()}`;
}
