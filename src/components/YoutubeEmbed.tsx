import { useTheme } from "@mui/material";

function YoutubeEmbed({ videoId, width, height }: { videoId: string, width?: string, height?: string }) {
    const theme = useTheme();
    return (
        <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; 
                        clipboard-write; encrypted-media; 
                        gyroscope; picture-in-picture; web-share"
            width={width || "100%"} height={height || "200px"}
            style={{
                borderRadius: theme.shape.borderRadius,
            }}
        // referrerpolicy="strict-origin-when-cross-origin" 
        ></iframe>
    )
}

export default YoutubeEmbed;