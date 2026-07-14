import { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";
import { FormatNumber, GetRulesetNameFromId } from "../util/Helper";
import { BuildProfileStatistics, MapScoreBeatmaps, ProcessBeatmaps, ProcessScores, ProcessUser } from "../util/ProfileHelper";

type ProfileContextValue = {
    getUser: (userId: string | number) => Promise<any>;
    getScoreById: (scoreId: string | number) => any;
    getApiUser: () => any;
    userLive: any;
    scoresLive: any;
    setUserId: (userId: string | number) => void;
    fetchFullProfile: (userId: string | number) => Promise<void>;
    errorMessage: string | boolean;
    fetchLog: any[];
    isFinished: boolean;
    activeRuleset: string;
    setActiveRuleset: (ruleset: string) => void;
    getRulesetStatistics: (ruleset: string, without_loved?: boolean) => any;
    getRulesetUser: (ruleset: string) => any;
    availableRulesets: string[];
    loadDurationMs: number;
    getScoresByIds: (scoreIds: (string | number)[]) => any[];
    getAllScores: () => any[];
};

const ProfileContext = createContext<ProfileContextValue>({} as ProfileContextValue);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { getUserLive, getScoresLive, getBeatmapsLive, getBeatmapPacks } = useApi();
    const [userId, setUserId] = useState<string | number | null>(null);
    const [userLive, setUserLive] = useState<any>(null);
    const [scoresLive, setScoresLive] = useState<any>(null);
    const [beatmapsLive, setBeatmapsLive] = useState<any>(null);
    const [beatmapPacks, setBeatmapPacks] = useState<any>(null);
    const [profileStatistics, setProfileStatistics] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const [fetchLog, setFetchLog] = useState<any>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [loadDurationMs, setLoadDurationMs] = useState(0);

    const [activeRuleset, setActiveRuleset] = useState<any>(null);
    const [availableRulesets, setAvailableRulesets] = useState<any>([]);


    //lookup map by score id, primarily for charts that should only store score ids
    const [scoreMap, setScoreMap] = useState<{ [key: string]: any }>({});

    const getScoreById = (scoreId: string | number) => {
        return scoreMap[scoreId] || null;
    }

    const getScoresByIds = (scoreIds: (string | number)[]) => {
        return scoreIds.map(scoreId => scoreMap[scoreId] || null).filter(score => score !== null);
    }

    const getRulesetStatistics = (ruleset: string, without_loved = false) => {
        if (!profileStatistics) return null;

        const internalId = GetRulesetNameFromId(ruleset);
        if (without_loved) {
            return profileStatistics.without_loved.rulesets[internalId];
        }
        return profileStatistics.default.rulesets[internalId];
    }

    const getRulesetUser = (ruleset: string) => {
        if (!userLive) return null;

        const internalId = GetRulesetNameFromId(ruleset);
        return userLive.osuAlternative.rulesets[internalId];
    }

    const getApiUser = () => {
        return userLive?.osuApi || null;
    }

    const getUser = async (_userId: string | number) => {
        let _user = await getUserLive(_userId);
        _user = await ProcessUser(_user);
        setUserLive(_user);
        setUserId(_userId);
        return _user;
    }

    const getAllScores = () => {
        return scoresLive || [];
    }

    const reset = () => {
        setUserId(null);
        setUserLive(null);
        setScoresLive(null);
        setBeatmapsLive(null);
        setProfileStatistics(null);
        setErrorMessage(false);
        setFetchLog([]);
        setIsFinished(false);
        setActiveRuleset(0);
        setLoadDurationMs(0);
        setAvailableRulesets([]);
        setScoreMap({});
    }

    const fetchFullProfile = async (_userId: string | number) => {
        //if user id didnt change, keep as is
        if (userId === _userId) {
            return;
        }

        reset();
        try {
            let startMsGlobal = Date.now();
            //This setup is kinda ass but I dont think it matters
            let _fetchLog = [];

            _fetchLog.push("%working% Fetching user data");
            setFetchLog([..._fetchLog]);
            let startMs = Date.now();
            const user = await getUser(_userId);
            let endMs = Date.now();
            _fetchLog.pop();
            if(!user.is_sync){
                _fetchLog.push(`%warning% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched user data (not synced)`);
            }else{
                _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched user data`);
            }
            setFetchLog([..._fetchLog]);

            
            _fetchLog.push("%working% Fetching scores (can take a while)");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            const scores = await getScoresLive(_userId);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched ${FormatNumber(scores.length)} scores`);
            setFetchLog([..._fetchLog]);

            
            _fetchLog.push("%working% Fetching beatmaps (can take a while)");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            const beatmaps = await getBeatmapsLive();
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched ${FormatNumber(beatmaps.length)} beatmaps`);
            setFetchLog([..._fetchLog]);


            _fetchLog.push("%working% Fetching beatmap packs");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            const packs = await getBeatmapPacks();
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched ${FormatNumber(packs.length)} beatmap packs`);
            setFetchLog([..._fetchLog]);
            
            _fetchLog.push("%working% Processing beatmaps");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            const _beatmaps = ProcessBeatmaps(beatmaps);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Processed beatmaps`);
            setFetchLog([..._fetchLog]);
            
            _fetchLog.push("%working% Mapping beatmaps to scores");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            const [mappedScores, missingCount] = await MapScoreBeatmaps(scores, _beatmaps);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Mapped beatmaps to scores (${FormatNumber(missingCount)} scores missing beatmaps)`);
            setFetchLog([..._fetchLog]);
            
            _fetchLog.push("%working% Processing scores");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            let processedScores = await ProcessScores(mappedScores, user);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Processed scores`);
            setFetchLog([..._fetchLog]);
            
            _fetchLog.push("%working% Building profile statistics");
            setFetchLog([..._fetchLog]);
            await new Promise(resolve => setTimeout(resolve, 250));
            startMs = Date.now();
            console.log(packs);
            const { profileStats, profileStatsWithoutLoved } = await BuildProfileStatistics(processedScores, _beatmaps, packs);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Built profile statistics`);
            setFetchLog([..._fetchLog]);
            
            let _scoreMap: { [key: string]: any } = {};
            processedScores.forEach(score => {
                _scoreMap[score.id] = score;
            });
            
            //If available rulesets only has 'total', throw error (user has no scores)
            if (Object.keys(profileStats.rulesets).length === 1 && profileStats.rulesets['total']) {
                throw new Error("User has no scores available.");
            }

            let endMsGlobal = Date.now();
            setLoadDurationMs(endMsGlobal - startMsGlobal);
            setBeatmapPacks(packs);
            setBeatmapsLive(_beatmaps);
            setScoresLive(processedScores);
            setProfileStatistics({
                default: profileStats,
                without_loved: profileStatsWithoutLoved
            });
            setAvailableRulesets(Object.keys(profileStats.rulesets));
            setScoreMap(_scoreMap);
            if (!profileStats.rulesets[GetRulesetNameFromId(activeRuleset)]) {
                setActiveRuleset('all');
            }
            setIsFinished(true);
        } catch (error: any) {
            reset(); //reset all data on error to prevent showing incomplete data
            console.error("Error fetching full profile:", error);
            setErrorMessage(error.message || "An unknown error occurred while fetching profile data.");
            setIsFinished(false);
        }
    }

    return (
        <ProfileContext.Provider value={{ getUser, getScoreById, getApiUser, userLive, scoresLive, setUserId, fetchFullProfile, errorMessage, fetchLog, isFinished, activeRuleset, setActiveRuleset, getRulesetStatistics, getRulesetUser, availableRulesets, loadDurationMs, getScoresByIds, getAllScores }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    return useContext(ProfileContext);
}
