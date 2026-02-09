import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import { Alert, Box, CircularProgress, Grid, Paper } from "@mui/material";
import PlayerCard from "../components/PlayerCard";
import { usePageTitle } from "../providers/TitleProvider";

function RoutePeople() {
    usePageTitle("People");

    const { getRoleUsers } = useApi();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await getRoleUsers();
                if (!response || !response.roles || !response.users) {
                    throw new Error("Invalid response from API");
                }

                const roles = response.roles;

                const roleMap = {};
                roles.forEach(role => {
                    roleMap[role.id] = {
                        role: role,
                        users: []
                    }
                });

                const users = response.users;
                users.forEach(user => {
                    const _roles = user.roles;
                    if (_roles && _roles.length > 0) {
                        _roles.forEach(role => {
                            if (roleMap[role.id]) {
                                roleMap[role.id].users.push(user);
                            }
                        })
                    }
                });

                //sort users in each role by amount of roles they have (more roles means higher index)
                Object.values(roleMap).forEach(role => {
                    role.users.sort((a, b) => (b.roles ? b.roles.length : 0) - (a.roles ? a.roles.length : 0));
                });

                const vals = Object.values(roleMap);
                //sort by role.priority descending
                vals.sort((a, b) => b.role.priority - a.role.priority);

                setData(vals);
            } catch (error) {
                console.error("Failed to fetch people data:", error);
                setError("Failed to load people data. Please try again later.");
            } finally {
                setLoading(false);
            }
        })();
    }, [])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error || !data || data.length === 0) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error || "Data is empty for some reason. Please try again later."}
            </Alert>
        )
    }

    return (
        <Box sx={{ p: 2 }}>
            {
                data.map((roleData, index) => (
                    <Paper key={index} sx={{ mb: 4, p: 2 }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 16, height: 16, backgroundColor: `${roleData.role.color}`, borderRadius: '50%', mr: 1 }} />
                            <Box sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{roleData.role.title}</Box>
                        </Box>
                        <Box>
                            <Grid container spacing={2}>
                                {roleData.users.map((user, index) => (
                                    <Grid size={{ xs: 12, md: 3 }} key={index}>
                                        <PlayerCard data={user} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                ))
            }
        </Box>
    )
}

export default RoutePeople;