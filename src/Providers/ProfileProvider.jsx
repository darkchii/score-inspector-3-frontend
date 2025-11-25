import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";
import { FormatNumber } from "../Misc/Helper";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [userLive, setUserLive] = useState(null);
    const [scoresLive, setScoresLive] = useState(null);
    const [beatmapsLive, setBeatmapsLive] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const { getUserLive, getScoresLive, getBeatmapsLive } = useApi();
    const [fetchLog, setFetchLog] = useState([]);
    const [isFinished, setIsFinished] = useState(false);

    const getUser = async (_userId) => {
        const _user = await getUserLive(_userId);  
        setUserLive(_user);
        setUserId(_userId);
        return _user;
    }

    const getScores = async (_userId) => {
        const _score = await getScoresLive(_userId);
        setScoresLive(_score);
        return _score;
    }

    const getBeatmaps = async () => {
        const _beatmaps = await getBeatmapsLive();
        setBeatmapsLive(_beatmaps);
        return _beatmaps;
    }

    const fetchFullProfile = async (_userId) => {
        setFetchLog([]);
        setErrorMessage(false);
        setIsFinished(false);
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

            setIsFinished(true);
        }catch(error){
            console.error("Error fetching full profile:", error);
            setErrorMessage(error.message || "An unknown error occurred while fetching profile data.");
        }
    }

    return (
        <ProfileContext.Provider value={{ getUser, userLive, scoresLive, setUserId, fetchFullProfile, errorMessage, fetchLog, isFinished }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    return useContext(ProfileContext);
}