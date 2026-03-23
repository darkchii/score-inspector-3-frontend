import { Avatar, Card, CardContent, CardHeader, CircularProgress, Divider, Typography, useTheme } from "@mui/material";

function LandingCard({ children, title, isLoading, isError, icon = null, color = null, sx = {}, centerContent = false }: {
    children: React.ReactNode,
    title: string,
    isLoading: boolean,
    isError: boolean,
    icon?: React.ReactNode,
    color?: string | null,
    sx?: object,
    centerContent?: boolean,
}) {
    const theme = useTheme();

    //icon needs to be a bit smaller than the avatar size to fit well, so we apply a transform to scale it down
    const scaledIcon = icon ? (
        <div style={{ transform: 'scale(0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            {icon}
        </div>
    ) : null;

    return (
        <Card elevation={1} sx={{ padding: 0, ...sx }}>
            <CardHeader title={
                <Typography sx={{ fontSize: "15px", fontWeight: 500 }}>
                    {title}
                </Typography>
            }
                avatar={<Avatar sx={{ bgcolor: color, width: 28, height: 28 }}>{scaledIcon}</Avatar>}
                sx={{
                    height: "56px",
                    ".MuiCardHeader-avatar": {
                        color: theme.palette.primary.main,
                        marginRight: "8px",
                    },
                    ".MuiCardHeader-action": {
                        margin: 0,
                    },
                    p: 1,
                    m: 0
                }}
            />
            <Divider />
            <CardContent sx={{
                display: centerContent ? "flex" : "block",
                justifyContent: centerContent ? "center" : "flex-start",
                alignItems: centerContent ? "center" : "flex-start",
                textAlign: centerContent ? "center" : "left",
                p: 1,
                height: centerContent ? "calc(100% - 50px)" : "auto",
            }}>
                {isLoading ? (
                    <CircularProgress size={24} />
                ) : isError ? (
                    <Typography variant="body2" color="error">Error</Typography>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

export default LandingCard;