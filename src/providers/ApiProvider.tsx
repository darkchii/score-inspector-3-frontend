import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ApiContextValue } from "./ContextTypes";

const ApiContext = createContext<ApiContextValue>({} as ApiContextValue);
const apiAge = 1000 * 60 * 10; //10 minutes

export function ApiProvider({ children }: { children: React.ReactNode }) {
    // Use useRef instead of useState to prevent re-renders when cache updates
    const apiCacheRef = useRef({});

    const getApiUrl = useCallback(() => {
        if(import.meta.env.NODE_ENV === 'development') {
            return import.meta.env.VITE_API_BASE_URL_DEV;
        }
        return import.meta.env.VITE_API_BASE_URL;
    }, []);

    const apiGet = useCallback(async (endpoint: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const now = Date.now();
        const cached: { data: any; timestamp: number } | undefined = apiCacheRef.current[endpoint as keyof typeof apiCacheRef.current] as any;
        if (cached && (now - cached.timestamp < apiAge)) {
            return cached.data;
        }

        //return both data and progress
        const url = `${getApiUrl()}${endpoint}`;
        const response = await axios.get(url, {
            onDownloadProgress: progressEvent || undefined
        });

        // Update cache without triggering re-renders
        apiCacheRef.current = {
            ...apiCacheRef.current,
            [endpoint]: {
                data: response.data,
                timestamp: now
            }
        };

        return response.data;
    }, [getApiUrl]);

    const apiPost = useCallback(async (endpoint: string, body: any, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const url = `${getApiUrl()}${endpoint}`;
        const response = await axios.post(url, body, {
            onUploadProgress: progressEvent || undefined
        });
        return response.data;
    }, [getApiUrl]);

    const getBeatmapsLive = useCallback(async (compact = false, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`beatmap/all?compact=${compact}`, progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmapPacks = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet('beatmappack/all', progressEvent);
        return response;
    }, [apiGet]);

    const getUserLive = useCallback(async (userId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/${userId}/profile`, progressEvent);
        return response;
    }, [apiGet]);

    const getScoresLive = useCallback(async (userId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/${userId}/scores`, progressEvent);
        return response;
    }, [apiGet]);

    const getCompletionists = useCallback(async () => {
        const response = await apiGet(`user/completionists`);
        return response;
    }, [apiGet]);

    const getUserSearch = useCallback(async (query: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/search/${encodeURIComponent(query)}`, progressEvent);
        return response;
    }, [apiGet]);

    const getLeaderboard = useCallback(async (ruleset: string, statistic: string, page: number, sort_direction: string = "desc", limit: number = 50, country: string | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/${ruleset}/${statistic}/${page}/${sort_direction}/${limit}/${country || ''}`, progressEvent);
        return response;
    }, [apiGet]);

    const getTodayTopPlayers = useCallback(async(ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/top-day/${ruleset}`, progressEvent);
        return response;
    }, [apiGet]);

    const getGlobalStats = useCallback(async(progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/global-stats`, progressEvent);
        return response;
    }, [apiGet]);

    const getScoreSubmissions = useCallback(async (ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/score-submissions/${ruleset}`, progressEvent);
        return response;
    }, [apiGet]);

    const getActiveUsers = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/active-users`, progressEvent);
        return response;
    }, [apiGet]);

    const getRoleUsers = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/people`, progressEvent);
        return response;
    }, [apiGet]);

    const getServerInfo = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`system/info`, progressEvent);
        return response;
    }, [apiGet]);

    const getAlerts = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`system/alerts`, progressEvent);
        return response;
    }, [apiGet]);

    const getProcessedRealm = useCallback(async (realmFile: File, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const formData = new FormData();
        formData.append('realmFile', realmFile);

        const response = await apiPost(`system/process-realm`, formData, progressEvent);
        return response;
    }, [apiPost]);

    const getScoreRankDates = useCallback(async (ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/score-rank/info/${ruleset}`, progressEvent);
        return response;
    }, [apiGet]);

    const getHistoricScoreRanks = useCallback(async (ruleset: string, stat: string, date: string, page: number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/score-rank/${ruleset}/${stat}/${date}/${page}`, progressEvent);
        return response;
    }, [apiGet]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        getUserLive,
        getScoresLive,
        getBeatmapsLive,
        getBeatmapPacks,
        getCompletionists,
        getUserSearch,
        getLeaderboard,
        getTodayTopPlayers,
        getGlobalStats,
        getScoreSubmissions,
        getActiveUsers,
        getRoleUsers,
        getServerInfo,
        getAlerts,
        getProcessedRealm,
        getScoreRankDates,
        getHistoricScoreRanks
    }), [
        getUserLive,
        getScoresLive,
        getBeatmapsLive,
        getBeatmapPacks,
        getCompletionists,
        getUserSearch,
        getLeaderboard,
        getTodayTopPlayers,
        getGlobalStats,
        getScoreSubmissions,
        getActiveUsers,
        getRoleUsers,
        getServerInfo,
        getAlerts,
        getProcessedRealm,
        getScoreRankDates,
        getHistoricScoreRanks
    ]);

    return (
        <ApiContext.Provider value={contextValue}>
            {children}
        </ApiContext.Provider>
    )
}

export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }

    return context;
}