import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiProvider";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [userLive, setUserLive] = useState(null);
    const { getUserLive } = useApi();

    const getUser = async (_userId) => {
        const _user = await getUserLive(_userId);        
        setUserLive(_user);
        setUserId(_userId);
        console.log(_user);
        return _user;
    }

    return (
        <ProfileContext.Provider value={{ getUser, userLive, setUserId }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    return useContext(ProfileContext);
}