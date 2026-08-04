export function extractYoutubeId(input: string | null | undefined): string | null {
    if (!input || typeof input !== "string") {
        return null;
    }

    const value = input.trim();
    if (!value) {
        return null;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
        return value;
    }

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();

        if (host.includes("youtu.be")) {
            const candidate = parsed.pathname.split("/").filter(Boolean)[0] || "";
            return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
        }

        if (host.includes("youtube.com")) {
            const v = parsed.searchParams.get("v");
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
                return v;
            }

            const pathParts = parsed.pathname.split("/").filter(Boolean);
            if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
                const candidate = pathParts[1] || "";
                return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
            }
        }
    } catch (error) {
        return null;
    }

    return null;
}

export function extractSpotifyPath(input: string | null | undefined): string | null {
    if (!input || typeof input !== "string") {
        return null;
    }

    const value = input.trim();
    if (!value) {
        return null;
    }

    const spotifyPathRegex = /^(track|album|playlist|episode|show)\/([a-zA-Z0-9]{22})$/;
    const spotifyUriRegex = /^spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]{22})$/;

    if (spotifyPathRegex.test(value)) {
        return value;
    }

    const uriMatch = value.match(spotifyUriRegex);
    if (uriMatch) {
        return `${uriMatch[1]}/${uriMatch[2]}`;
    }

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();
        if (!host.includes("spotify.com")) {
            return null;
        }

        const pathParts = parsed.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "embed") {
            pathParts.shift();
        }

        if (pathParts.length < 2) {
            return null;
        }

        const type = pathParts[0];
        const id = pathParts[1];
        const normalized = `${type}/${id}`;
        return spotifyPathRegex.test(normalized) ? normalized : null;
    } catch (error) {
        return null;
    }
}