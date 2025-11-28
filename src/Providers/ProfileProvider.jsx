import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";
import { FormatNumber, GetRulesetNameFromId } from "../Misc/Helper";
import { BuildProfileStatistics, MapScoreBeatmaps, ProcessBeatmaps, ProcessScores, ProcessUser } from "../Misc/ProfileHelper";
import { useParams } from "react-router";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [userLive, setUserLive] = useState(null);
    const [scoresLive, setScoresLive] = useState(null);
    const [beatmapsLive, setBeatmapsLive] = useState(null);
    const [profileStatistics, setProfileStatistics] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const { getUserLive, getScoresLive, getBeatmapsLive } = useApi();
    const [fetchLog, setFetchLog] = useState([]);
    const [isFinished, setIsFinished] = useState(false);

    const [activeRuleset, setActiveRuleset] = useState(null);
    const [availableRulesets, setAvailableRulesets] = useState([]);

    const getRulesetStatistics = (ruleset) => {
        if (!profileStatistics) return null;

        const internalId = GetRulesetNameFromId(ruleset);
        return profileStatistics.rulesets[internalId];
    }

    const getRulesetUser = (ruleset) => {
        if (!userLive) return null;

        const internalId = GetRulesetNameFromId(ruleset);
        return userLive.osuAlternative.rulesets[internalId];
    }

    const getUser = async (_userId) => {
        let _user = await getUserLive(_userId);
        _user = await ProcessUser(_user);
        console.log(_user);
        setUserLive(_user);
        setUserId(_userId);
        return _user;
    }

    const getScores = async (_userId) => {
        const _score = await getScoresLive(_userId);
        console.log(_score);
        setScoresLive(_score);
        return _score;
    }

    const getBeatmaps = async () => {
        const _beatmaps = await getBeatmapsLive();
        console.log(_beatmaps);
        setBeatmapsLive(_beatmaps);
        return _beatmaps;
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
    }

    const fetchFullProfile = async (_userId) => {
        //if user id didnt change, keep as is
        if (userId === _userId) {
            return;
        }

        reset();
        try {
            //This setup is kinda ass but I dont think it matters
            let _fetchLog = [];

            _fetchLog.push("%working% Fetching user data");
            setFetchLog(_fetchLog);
            let startMs = Date.now();
            await getUser(_userId);
            let endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched user data`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Fetching scores");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            const scores = await getScores(_userId);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched ${FormatNumber(scores.length)} scores`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Fetching beatmaps");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            const beatmaps = await getBeatmaps();
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Fetched ${FormatNumber(beatmaps.length)} beatmaps`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Processing beatmaps");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            await ProcessBeatmaps(beatmaps);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Processed beatmaps`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Mapping beatmaps to scores");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            const [mappedScores, missingCount] = await MapScoreBeatmaps(scores, beatmaps);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Mapped beatmaps to scores (${FormatNumber(missingCount)} scores missing beatmaps)`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Processing scores");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            await ProcessScores(scores);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Processed scores`);
            setFetchLog(_fetchLog);

            _fetchLog.push("%working% Building profile statistics");
            setFetchLog(_fetchLog);
            startMs = Date.now();
            const profileStats = await BuildProfileStatistics(scores, beatmaps);
            endMs = Date.now();
            _fetchLog.pop();
            _fetchLog.push(`%finished% (${((endMs - startMs) / 1000).toFixed(2)}s) Built profile statistics`);
            setFetchLog(_fetchLog);
            setProfileStatistics(profileStats);

            setAvailableRulesets(Object.keys(profileStats.rulesets));

            //If available rulesets only has 'total', throw error (user has no scores)
            if (Object.keys(profileStats.rulesets).length === 1 && profileStats.rulesets['total']) {
                throw new Error("User has no scores available.");
            }

            //If current active ruleset is set to a "non-existent" ruleset, set it to 'all'
            if (!profileStats.rulesets[GetRulesetNameFromId(activeRuleset)]) {
                setActiveRuleset('all');
            }

            setIsFinished(true);
        } catch (error) {
            console.error("Error fetching full profile:", error);
            setErrorMessage(error.message || "An unknown error occurred while fetching profile data.");
        }
    }

    return (
        <ProfileContext.Provider value={{ getUser, userLive, scoresLive, setUserId, fetchFullProfile, errorMessage, fetchLog, isFinished, activeRuleset, setActiveRuleset, getRulesetStatistics, getRulesetUser, availableRulesets }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    return useContext(ProfileContext);
}