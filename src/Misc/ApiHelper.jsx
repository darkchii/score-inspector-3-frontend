import Config from '../Data/Config.json';

function GetApiMode() {
    return Config.DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION';
}

export function GetAPI() {
    return Config.API[GetApiMode()].API_URL;
}

export function GetOsuClientID() {
    return Config.API[GetApiMode()].OSU_CLIENT_ID;
}

export function GetOsuApiRedirect() {
    return Config.API[GetApiMode()].AUTH_REDIRECT;
}

export function GetOsuAuthUrl() {
    return `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${GetOsuClientID()}&scope=identify%20public&redirect_uri=${GetOsuApiRedirect()}`
}
