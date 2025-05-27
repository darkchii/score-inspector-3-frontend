import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShowNotification } from "../Misc/Helper";
import { GetAPI } from "../Misc/ApiHelper";
import axios from "axios";

const AuthContext = createContext();

const expectedLoginResponseFields = [
    'access_token', 'refresh_token', 'expires_in', 'token_type', 'user_id'
]

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
                ShowNotification(`Welcome back, ${response.data.username}!`, "success");
                setUser({ id: response.data.id, token_type: response.data.token_type });
            }catch(error) {
                console.error("Failed to fetch user data:", error);
                ShowNotification("Failed to fetch user data. Please log in again.", "error");
                reset();
                return;
            }
        }

        fetchUserData().then(() => {
            // setUser({ id: "user_id_placeholder", token_type: "Bearer" }); // Placeholder, replace with actual user data
            // setLoading(false);
        }).catch((error) => {
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
        } finally {
            setLoading(false);
        }
    }

    const login = async (code) => {
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
        setUser(null);
        setToken("");
        localStorage.removeItem("site");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
