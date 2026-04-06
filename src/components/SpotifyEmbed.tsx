import { useTheme } from "@mui/material";

function SpotifyEmbed({ embedPath, width, height }: { embedPath: string, width?: string, height?: string }) {
    const theme = useTheme();
    return (
        <iframe
            src={`https://open.spotify.com/embed/${embedPath}`}
            title="Spotify player"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            width={width || "100%"}
            height={height || "152px"}
            style={{
                borderRadius: theme.shape.borderRadius,
            }}
        ></iframe>
    );
}

export default SpotifyEmbed;
