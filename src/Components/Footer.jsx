import { AppBar, Box, Card, Toolbar, Typography } from "@mui/material";
import Config from "../data/Config.json";
import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";

function Footer() {
    const { getServerInfo } = useApi();

    const [clientVersion, setClientVersion] = useState(null);
    const [serverVersion, setServerVersion] = useState(null);
    const [isServerOnline, setIsServerOnline] = useState(true);
    const [isAltOnline, setIsAltOnline] = useState(true);

    useEffect(() => {
        setClientVersion(Config.VERSION);
        (async () => {
            try {
                const info = await getServerInfo();
                setServerVersion(info.version);
                setIsAltOnline(info.altDbAccessable);
                setIsServerOnline(true);
            }
            catch (error) {
                console.error("Failed to fetch server info:", error);
                setIsServerOnline(false);
            }
        })();
    }, []);

    return (
        <>
            <Box>
                <AppBar position="static" component={Card} sx={{
                    //no top border radius
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                }}>
                    <Toolbar>
                        <Typography>
                            Website made by Amayakase
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            {`Client version: ${clientVersion || "Loading..."}`}
                        </Typography>
                        <Box sx={{ width: 16 }} />
                        <Typography variant="caption" color={isServerOnline ? "text.secondary" : "error.main"}>
                            {isServerOnline ? `Server version: ${serverVersion || "Loading..."}` : "Server offline"}
                        </Typography>
                        {
                            <Box component="span"
                                sx={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: isServerOnline ? 'success.main' : 'error.main',
                                    ml: 0.5,
                                    mb: '2px',
                                }}
                            />
                        }
                        <Box sx={{ width: 16 }} />
                        <Typography variant="caption" color={isAltOnline ? "text.secondary" : "error.main"}>
                            osu!alternative
                        </Typography>
                        {
                            <Box component="span"
                                sx={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: isAltOnline ? 'success.main' : 'error.main',
                                    ml: 0.5,
                                    mb: '2px',
                                }}
                            />
                        }
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    )
}

export default Footer;