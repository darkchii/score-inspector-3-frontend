import { Box, Skeleton, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function YoutubeEmbed({ videoId, width, height }: { videoId: string | null | undefined, width?: string, height?: string }) {
    const theme = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);
    const iframeSrc = useMemo(() => `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=0`, [videoId]);

    useEffect(() => {
        setIsLoaded(false);
    }, [iframeSrc]);

    if(!videoId) {
        return null;
    }

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: theme.shape.borderRadius,
                width: width || "100%",
                height: height || "200px",
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
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; 
                        clipboard-write; encrypted-media; 
                        gyroscope; picture-in-picture; web-share"
                width="100%"
                height="100%"
                onLoad={() => setIsLoaded(true)}
                style={{
                    border: 0,
                    opacity: isLoaded ? 1 : 0,
                    transition: "opacity 280ms ease",
                }}
            // referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>
        </Box>
    )
}

export default YoutubeEmbed;