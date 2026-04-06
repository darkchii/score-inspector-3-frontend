import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { IAuthUser, IScoreMod } from "../types/types";
import Score from "../types/Score";

type ApiContextValue = {
    getUserLive: (userId: string | number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getScoresLive: (userId: string | number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapsLive: (compact?: boolean, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapPacks: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getCompletionists: () => Promise<any>;
    getUserSearch: (query: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getLeaderboard: (ruleset: string, statistic: string, page: number, sort_direction?: string, limit?: number, country?: string | null, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getTodayTopPlayers: (ruleset: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getGlobalStats: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getScoreSubmissions: (ruleset: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getActiveUsers: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getRoleUsers: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getServerInfo: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getAlerts: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getProcessedRealm: (realmFile: File, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getScoreRankDates: (ruleset: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getHistoricScoreRanks: (ruleset: string, stat: string, date: string, page: number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    postReputation: (type: string, targetId: string | number, userId: string | number, token: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getTopReputations: (type: string, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    postRegisterVisitor: (targetId: string | number, userId: string | number, token: string | null, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getRecentVisitors: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmap: (beatmapId: string | number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapSet: (beatmapsetId: string | number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    updateBeatmapSetMedia: (beatmapsetId: string | number, accessToken: string, youtubeUrl: string | null, spotifyUrl?: string | null, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapMediaAudit: (accessToken: string, limit?: number, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getDifficulty: (beatmapId: string | number, rulesetId?: number, mods?: IScoreMod[] | null, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapUserTags: (progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
    getBeatmapScores: (beatmapId: string | number, ruleset: string | null, mods?: IScoreMod[] | null, progressEvent?: ((progressEvent: AxiosProgressEvent) => void) | null) => Promise<any>;
};

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

    const apiGet = useCallback(async (
        endpoint: string, 
        shouldCache: boolean = true,
        progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const now = Date.now();
        if(shouldCache) {
            const cached: { data: any; timestamp: number } | undefined = apiCacheRef.current[endpoint as keyof typeof apiCacheRef.current] as any;
            if (cached && (now - cached.timestamp < apiAge)) {
                return cached.data;
            }
        }

        //return both data and progress
        const url = `${getApiUrl()}${endpoint}`;
        const response = await axios.get(url, {
            onDownloadProgress: progressEvent || undefined
        });

        // Update cache without triggering re-renders
        if(shouldCache) {
            apiCacheRef.current = {
                ...apiCacheRef.current,
                [endpoint]: {
                    data: response.data,
                    timestamp: now
                }
            };
        }

        return response.data;
    }, [getApiUrl]);

    const apiPost = useCallback(async (endpoint: string, body: any, contentType: string | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const url = `${getApiUrl()}${endpoint}`;
        // const response = await axios.post(url, body, {
        //     onUploadProgress: progressEvent || undefined,
        // });
        //use fetch instead
        const response = await fetch(url, {
            method: 'POST',
            body: body,
            // headers: {
            //     'Content-Type': contentType || 'application/json',
            // },
            //only add headers if contentType is provided
            headers: contentType ? {
                'Content-Type': contentType,
            } : undefined,
        });
        //if not 200-299 throw error (with response data if possible)
        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += `: ${JSON.stringify(errorData)}`;
            } catch (e) {
                // ignore JSON parsing errors
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    }, [getApiUrl]);

    const getBeatmapsLive = useCallback(async (compact = false, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`beatmap/all?compact=${compact}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmapPacks = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet('beatmappack/all', true, progressEvent);
        return response;
    }, [apiGet]);

    const getUserLive = useCallback(async (userId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/${userId}/profile`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getScoresLive = useCallback(async (userId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/${userId}/scores`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getCompletionists = useCallback(async () => {
        const response = await apiGet(`user/completionists`, true);
        return response;
    }, [apiGet]);

    const getUserSearch = useCallback(async (query: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/search/${encodeURIComponent(query)}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getLeaderboard = useCallback(async (ruleset: string, statistic: string, page: number, sort_direction: string = "desc", limit: number = 50, country: string | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/${ruleset}/${statistic}/${page}/${sort_direction}/${limit}/${country || ''}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getTodayTopPlayers = useCallback(async(ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/top-day/${ruleset}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getGlobalStats = useCallback(async(progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/global-stats`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getScoreSubmissions = useCallback(async (ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/score-submissions/${ruleset}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getActiveUsers = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`stats/active-users`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getRoleUsers = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`user/people`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getServerInfo = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`system/info`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getAlerts = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`system/alerts`, false, progressEvent);
        return response;
    }, [apiGet]);

    const getProcessedRealm = useCallback(async (realmFile: File, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const formData = new FormData();
        formData.append('realmFile', realmFile);

        const response = await apiPost(`system/process-realm`, formData, null, progressEvent);
        return response;
    }, [apiPost]);

    const getScoreRankDates = useCallback(async (ruleset: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/score-rank/info/${ruleset}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getHistoricScoreRanks = useCallback(async (ruleset: string, stat: string, date: string, page: number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`leaderboard/score-rank/${ruleset}/${stat}/${date}/${page}`, true, progressEvent);
        return response;
    }, [apiGet]);

    const postReputation = useCallback(async (type: string, targetId: string | number, userId: string | number, token: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const data = {
            type,
            targetId,
            userId,
            token
        }

        const response = await apiPost(`reputation/`, JSON.stringify(data), 'application/json', progressEvent);
        return response;
    }, [apiPost]);

    const getTopReputations = useCallback(async (type: string, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`reputation/top/${type}`, false, progressEvent);
        return response;
    }, [apiGet]);

    const postRegisterVisitor = useCallback(async (targetId: string | number, userId: string | number, token: string | null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const data = {
            targetId,
            userId,
            token
        }

        const response = await apiPost(`visitor/`, JSON.stringify(data), 'application/json', progressEvent);
        return response;
    }, [apiPost]);

    const getRecentVisitors = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`visitor/recent`, false, progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmap = useCallback(async (beatmapId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`beatmap/${beatmapId}`, false, progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmapSet = useCallback(async (beatmapsetId: string | number, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`beatmap/set/${beatmapsetId}`, false, progressEvent);
        return response;
    }, [apiGet]);

    const updateBeatmapSetMedia = useCallback(async (beatmapsetId: string | number, accessToken: string, youtubeUrl: string | null, spotifyUrl: string | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const body = {
            access_token: accessToken,
            youtube_url: youtubeUrl,
            spotify_url: spotifyUrl,
        };

        const response = await apiPost(`beatmap/set/${beatmapsetId}/media`, JSON.stringify(body), 'application/json', progressEvent);
        return response;
    }, [apiPost]);

    const getBeatmapMediaAudit = useCallback(async (accessToken: string, limit: number = 100, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const body = {
            access_token: accessToken,
            limit,
        };

        const response = await apiPost('admin/beatmap-media-audit', JSON.stringify(body), 'application/json', progressEvent);
        return response;
    }, [apiPost]);

    const getDifficulty = useCallback(async (beatmapId: string | number, rulesetId: number = 0, mods: IScoreMod[] | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        let endpoint = `difficulty/${rulesetId}/${beatmapId}`;

        const body = {
            mods
        };

        const response = await apiPost(endpoint, JSON.stringify(body), 'application/json', progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmapUserTags = useCallback(async (progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        const response = await apiGet(`beatmap/tags`, true, progressEvent);
        return response;
    }, [apiGet]);

    const getBeatmapScores = useCallback(async (beatmapId: string | number, ruleset: string | null, mods: IScoreMod[] | null = null, progressEvent: ((progressEvent: AxiosProgressEvent) => void) | null = null) => {
        let endpoint = `beatmap/${beatmapId}/scores`;
        if(ruleset) {
            endpoint += `/${ruleset}`;
        }
        const body = {
            mods
        };
        const response = await apiPost(endpoint, JSON.stringify(body), 'application/json', progressEvent);

        // parse some stuff
        const osu_api_scores = response?.api || [];
        const osu_alt_scores = response?.alt || []; //these always exclude scores that are given by api
        const all_scores = [...osu_api_scores, ...osu_alt_scores];

        return all_scores;
    }, [apiPost]);

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
        getHistoricScoreRanks,
        postReputation,
        getTopReputations,
        postRegisterVisitor,
        getRecentVisitors,
        getBeatmap,
        getBeatmapSet,
        updateBeatmapSetMedia,
        getBeatmapMediaAudit,
        getDifficulty,
        getBeatmapUserTags,
        getBeatmapScores
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
        getHistoricScoreRanks,
        postReputation,
        getTopReputations,
        postRegisterVisitor,
        getRecentVisitors,
        getBeatmap,
        getBeatmapSet,
        updateBeatmapSetMedia,
        getBeatmapMediaAudit,
        getDifficulty,
        getBeatmapUserTags,
        getBeatmapScores
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