import { Box, Skeleton, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function SpotifyEmbed({ embedPath, width, height }: { embedPath: string, width?: string, height?: string }) {
    const theme = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);
    const iframeSrc = useMemo(() => `https://open.spotify.com/embed/${embedPath}`, [embedPath]);

    useEffect(() => {
        setIsLoaded(false);
    }, [iframeSrc]);

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: theme.shape.borderRadius,
                width: width || "100%",
                height: height || "152px",
                backgroundColor: "rgba(255,255,255,0.06)",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: isLoaded ? 0 : 1,
                    transition: "opacity 240ms ease",
                    pointerEvents: "none",
                }}
            >
                <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
            </Box>
            <iframe
                src={iframeSrc}
                title="Spotify player"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                width="100%"
                height="100%"
                onLoad={() => setIsLoaded(true)}
                style={{
                    border: 0,
                    opacity: isLoaded ? 1 : 0,
                    transition: "opacity 280ms ease",
                }}
            ></iframe>
        </Box>
    );
}

export default SpotifyEmbed;
