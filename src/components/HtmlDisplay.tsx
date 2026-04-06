import DOMPurify from 'dompurify';
import parse, { domToReact } from 'html-react-parser';
import PlayerLink from './PlayerLink';
import { Box, Paper, Link } from '@mui/material';
import { Link as RLink} from 'react-router';

function fitImage(node: any) {
    if (node.name !== "img") return;

    //make sure image widths fit the container, but keep aspect ratio
    return <img src={node.attribs.src} style={{ maxWidth: "100%", height: "auto" }} />;
}

function replaceRegularUrl(node: any) {
    if (node.name !== "a") return;
    const href = node.attribs?.href || "";

    // console.log("Found link in description:", href);
    try {
        return <Link href={href} target="_blank" rel="noopener noreferrer">{domToReact(node.children)}</Link>;
    } catch(e) {
        // console.error("Error parsing link:", e);
        return;
    }
}

function replaceBeatmapUrl(node: any) {
    //if links leads to https://osu.ppy.sh/s/{set_id} or https://osu.ppy.sh/beatmapset/{set_id}
    //replace to local link /beatmapsets/{set_id}
    //if link leads to https://osu.ppy.sh/beatmapset/{set_id}#{mode}/{beatmap_id}
    //replace to local link /beatmapsets/{set_id}/{mode}/{beatmap_id}
    if (node.name !== "a") return;
    const href = node.attribs?.href || "";

    try {
        const url = new URL(href);
        if (url.hostname === "osu.ppy.sh") {
            const setMatch = url.pathname.match(/^\/s\/(\d+)/) || url.pathname.match(/^\/beatmapsets\/(\d+)/);
            if (setMatch) {
                const setId = setMatch[1];
                const hashMatch = url.hash.match(/^#(\w+)\/(\d+)/);
                if (hashMatch) {
                    const mode = hashMatch[1];
                    const beatmapId = hashMatch[2];
                    return <RLink to={`/beatmapsets/${setId}/${mode}/${beatmapId}`}>{domToReact(node.children)}</RLink>;
                }
                return <RLink to={`/beatmapsets/${setId}`}>{domToReact(node.children)}</RLink>;
            }
        }
    } catch(e) {
        // console.error("Error parsing beatmap link:", e);
        return;
    }
}

function replaceWellDiv(node: any, options: any) {
    if (node.name !== "div") return;

    const className = node.attribs?.class || "";
    const classes = className.split(/\s+/);

    //count amount of parent wells/papers, elevation based on that
    let elevation = 2;
    let parent = node.parent;
    while (parent) {
        const parentClassName = parent.attribs?.class || "";
        const parentClasses = parentClassName.split(/\s+/);
        if (parentClasses.includes("well")) {
            elevation++;
        }
        parent = parent.parent;
    }

    if (classes.includes("well")) {
        return (
            <Paper elevation={elevation} sx={{ padding: 1, marginY: 1 }}>
                {domToReact(node.children, options)}
            </Paper>
        );
    }
}

function extractUserIdFromLink(node: any) {
    if (node.name !== "a") return null;

    const attribs = node.attribs || {};
    const className = attribs.class || "";
    const dataUserId = attribs["data-user-id"];
    const href = attribs.href || "";

    // Case 1: osu usercard
    if (
        className.includes("user-name") &&
        className.includes("js-usercard") &&
        /^\d+$/.test(dataUserId || "")
    ) {
        return dataUserId;
    }

    // Case 2: profile URL
    try {
        const url = new URL(href);
        if (url.hostname === "osu.ppy.sh") {
            const match = url.pathname.match(/^\/users?\/(\d+)/);
            if (match) {
                return match[1];
            }
        }
    } catch { }

    return null;
}

function replaceUserLink(node: any, users: any) {
    const userId = extractUserIdFromLink(node);

    if (userId && users[userId]) {
        return <Box
            component="span"
            sx={{
                display: 'inline-flex',
            }}
        ><PlayerLink data={users[userId]} size={18} /></Box>;
    }
}

function createReplaceHandler(users: any) {
    const options = {
        replace(node: any) {
            if (node.type !== "tag") return;

            return (
                replaceWellDiv(node, options) ||
                replaceUserLink(node, users) ||
                replaceBeatmapUrl(node) ||
                replaceRegularUrl(node) ||
                fitImage(node)
            );
        },
    };

    return options.replace;
}

function HtmlDisplay({ html, userData }: { html: string, userData?: any }) {
    let clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    let userMap: { [user_id: number | string]: any } = {};
    for (let user of userData) {
        userMap[user.osuApi.id] = user;
    }

    return parse(clean, {
        replace: createReplaceHandler(userMap),
    });
}

export default HtmlDisplay;