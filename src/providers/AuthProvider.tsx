import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShowNotification } from "../util/Helper";
import { GetAPI } from "../util/ApiHelper";
import axios from "axios";
import { reputationTypes, type IAuthUser, type ReputationType } from "../types/types";

type AuthContextValue = {
    user: IAuthUser | null;
    userData: any;
    token: string;
    loading: boolean;
    login: (code: string) => Promise<void>;
    logout: () => void;
    setReputationAbility: (type: ReputationType, canGive: boolean) => void;
    canGiveReputationTo: (type: ReputationType) => boolean;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

const expectedLoginResponseFields = [
    'access_token', 'refresh_token', 'expires_in', 'token_type', 'user_id'
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<IAuthUser | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [canGiveReputation, setCanGiveReputation] = useState<Record<ReputationType, boolean>>({
        'user': false,
        'beatmap': false,
        'score': false,
    });
    const [token, setToken] = useState(localStorage.getItem("access_token") || "");
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token") || "");
    const [tokenExpiry, setTokenExpiry] = useState(localStorage.getItem("token_expiry") || "");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isValidToken = () => {
        if (!token || !tokenExpiry) return false;
        const expiryDate = new Date(tokenExpiry);
        return expiryDate > new Date();
    }

    const reset = () => {
        setUser(null);
        setUserData(null);
        setToken("");
        setRefreshToken("");
        setTokenExpiry("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_expiry");
        ShowNotification("Session reset. Please log in again.", "info");
    }

    useEffect(() => {
        if(!token || !refreshToken || !tokenExpiry) {
            setLoading(false);
            return;
        }

        if(!isValidToken()) {
            //try to refresh the token
            refresh();
            return;
        }

        const fetchUserData = async () => {
            try {
                const url = `${GetAPI()}/auth/me`;
                const response = await axios.post(url, {
                    access_token: token,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log("User data fetched successfully:", response.data);
                // ShowNotification("User data fetched successfully!", "success");
                ShowNotification(`Welcome back, ${response.data.osuApi.username}!`, "success");
                setUser({ id: response.data.osuApi.id, token_type: response.data.token_type });
                setUserData(response.data);

                // Set reputation abilities based on user data
                const _repStatus = canGiveReputation;
                if(response.data.reputation){
                    Object.keys(response.data.reputation).forEach(type => {
                        //they keys MAY not be user, beatmap, score, we can skip those
                        //they may be added during development on live database
                        if(reputationTypes.includes(type as ReputationType)){
                            const _date = response.data.reputation[type];
                            //only if >24 hours ago
                            const canGive = !_date || (new Date().getTime() - new Date(_date).getTime()) > 24 * 60 * 60 * 1000;
                            _repStatus[type as ReputationType] = canGive;
                        }
                    });

                    //if any of valid keys are not present, we can assume they can give reputation for that type
                    reputationTypes.forEach(type => {
                        if(!(type in response.data.reputation)){
                            _repStatus[type] = true;
                        }
                    });
                }

                console.log("Reputation status:", _repStatus);
                setCanGiveReputation(_repStatus);
            }catch(error) {
                console.error("Failed to fetch user data:", error);
                ShowNotification("Failed to fetch user data. Please log in again.", "error");
                reset();
                return;
            } finally {
                setLoading(false);
            }
        }

        fetchUserData().catch((error) => {
            console.error("Error fetching user data:", error);
            ShowNotification("Error fetching user data. Please log in again.", "error");
            reset();
        });
    }, [token, refreshToken, tokenExpiry]);

    const refresh = async () => {
        setLoading(true);
        try {
            if (!refreshToken) {
                ShowNotification("No refresh token available. Please log in again.", "error");
                reset();
                return;
            }

            const url = `${GetAPI()}/auth/refresh`;
            const response = await axios.post(url, {
                refresh_token: refreshToken,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;

            // Check if response data is ok
            if (!data || typeof data !== 'object' || !expectedLoginResponseFields.every(field => field in data)) {
                throw new Error("Invalid response format");
            }

            const { access_token, refresh_token, expires_in, token_type, user_id } = data;
            const expiryDate = new Date(Date.now() + expires_in * 1000);
            setUser({ id: user_id, token_type });
            setToken(access_token);
            setRefreshToken(refresh_token);
            setTokenExpiry(expiryDate.toISOString());

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("token_expiry", expiryDate.toISOString());

            ShowNotification("Token refreshed successfully!", "success");
        } catch (error) {
            ShowNotification("Failed to refresh token. Please log in again.", "error");
            console.error("Refresh token error:", error);
            reset();
        } finally {
            setLoading(false);
        }
    }

    const login = async (code: string) => {
        setLoading(true);
        try{
            if (isValidToken()) {
                ShowNotification("Already logged in!", "info");
                return;
            }

            const url = `${GetAPI()}/auth/login`;
            const response = await axios.post(url, {
                code: code,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;

            if (!data || typeof data !== 'object' || !expectedLoginResponseFields.every(field => field in data)) {
                throw new Error("Invalid response format");
            }

            const { access_token, refresh_token, expires_in, token_type, user_id } = data;
            const expiryDate = new Date(Date.now() + expires_in * 1000);
            setUser({ id: user_id, token_type });
            setToken(access_token);
            setRefreshToken(refresh_token);
            setTokenExpiry(expiryDate.toISOString());

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("token_expiry", expiryDate.toISOString());

            ShowNotification("Login successful!", "success");
            //todo: deal with response data
        }catch(error){
            ShowNotification("Login failed. Please try again.", "error");
            console.error("Login error:", error);
        }finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        reset();
        navigate("/");
    };

    const setReputationAbility = (type: 'user' | 'beatmap' | 'score', canGive: boolean) => {
        setCanGiveReputation(prev => ({ ...prev, [type]: canGive }));
    }

    const canGiveReputationTo = (type: 'user' | 'beatmap' | 'score'): boolean => {
        return canGiveReputation[type];
    }

    return (
        <AuthContext.Provider value={{ user, userData, token, loading, login, logout, setReputationAbility, canGiveReputationTo }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
