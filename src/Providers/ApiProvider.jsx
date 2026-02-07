import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();
const apiAge = 1000 * 60 * 10; //10 minutes

export function ApiProvider({ children }) {
    const [apiCache, setApiCache] = useState({});

    const getApiUrl = () => {
        if(import.meta.env.NODE_ENV === 'development') {
            return import.meta.env.VITE_API_BASE_URL_DEV;
        }
        return import.meta.env.VITE_API_BASE_URL;
    }

    const apiGet = async (endpoint, progressEvent = null) => {
        const now = Date.now();
        const cached = apiCache[endpoint];
        if (cached && (now - cached.timestamp < apiAge)) {
            return cached.data;
        }

        //return both data and progress
        const url = `${getApiUrl()}${endpoint}`;
        const response = await axios.get(url, {
            onDownloadProgress: progressEvent
        });

        setApiCache({
            ...apiCache,
            [endpoint]: {
                data: response.data,
                timestamp: now
            }
        });

        return response.data;
    }

    const getBeatmapsLive = async (progressEvent = null) => {
        const response = await apiGet('beatmap/all', progressEvent);
        return response;
    }

    const getBeatmapPacks = async (progressEvent = null) => {
        const response = await apiGet('beatmappack/all', progressEvent);
        return response;
    }

    const getUserLive = async (userId, progressEvent = null) => {
        const response = await apiGet(`user/${userId}/profile`, progressEvent);
        return response;
    }

    const getScoresLive = async (userId, progressEvent = null) => {
        const response = await apiGet(`user/${userId}/scores`, progressEvent);
        return response;
    }

    const getCompletionists = async () => {
        const response = await apiGet(`user/completionists`);
        return response;
    }

    const getUserSearch = async (query, progressEvent = null) => {
        const response = await apiGet(`user/search/${encodeURIComponent(query)}`, progressEvent);
        return response;
    }

    const getLeaderboard = async (ruleset, statistic, page, sort_direction = "desc", limit = 50, progressEvent = null) => {
        const response = await apiGet(`leaderboard/${ruleset}/${statistic}/${page}/${sort_direction}/${limit}`, progressEvent);
        return response;
    }

    const getTodayTopPlayers = async(progressEvent = null) => {
        const response = await apiGet(`stats/top-day`, progressEvent);
        return response;
    }

    const getGlobalStats = async(progressEvent = null) => {
        const response = await apiGet(`stats/global-stats`, progressEvent);
        return response;
    }

    const getScoreSubmissions = async (ruleset, progressEvent = null) => {
        const response = await apiGet(`stats/score-submissions/${ruleset}`, progressEvent);
        return response;
    }

    return (
        <ApiContext.Provider value={{ getUserLive, getScoresLive, getBeatmapsLive, getBeatmapPacks, getCompletionists, getUserSearch, getLeaderboard, getTodayTopPlayers, getGlobalStats, getScoreSubmissions }}>
            {children}
        </ApiContext.Provider>
    )
}

export function useApi() {
    return useContext(ApiContext);
}