import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

export function ApiProvider({ children }) {

    const getApiUrl = () => {
        if(import.meta.env.NODE_ENV === 'development') {
            return import.meta.env.VITE_API_BASE_URL_DEV;
        }
        return import.meta.env.VITE_API_BASE_URL;
    }

    const getUserLive = async (userId) => {
        const url = `${getApiUrl()}user/${userId}/profile`;
        const response = await axios.get(url);
        return response.data;
    }

    return (
        <ApiContext.Provider value={{ getUserLive }}>
            {children}
        </ApiContext.Provider>
    )
}

export function useApi() {
    return useContext(ApiContext);
}