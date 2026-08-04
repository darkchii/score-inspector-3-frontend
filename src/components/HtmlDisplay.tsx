import DOMPurify from 'dompurify';
import parse, { domToReact } from 'html-react-parser';
import PlayerLink from './PlayerLink';
import { Box, Paper, Link, Collapse, Divider, useTheme } from '@mui/material';
import { Link as RLink} from 'react-router';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SpoilerBox({ label, children }: { label: React.ReactNode, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    return (
        <Paper elevation={2} sx={{ my: 1, overflow: 'hidden' }}>
            <Box
                component="button"
                onClick={() => setOpen(o => !o)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: 'none',
                    border: 'none',
                    px: 1.5,
                    py: 1,
                    color: 'text.primary',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
            >
                <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {label}
                </Box>
                <ExpandMoreIcon
                    sx={{
                        fontSize: '1.25rem',
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                        ml: 1,
                        transition: 'transform 0.2s',
                        transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                />
            </Box>
            <Collapse in={open}>
                <Divider />
                <Box sx={{ px: 1.5, py: 1 }}>
                    {children}
                </Box>
            </Collapse>
        </Paper>
    );
}

function replaceSpoilerBox(node: any, options: any) {
    if (node.name !== "div") return;
    const className = node.attribs?.class || "";
    const classes = className.split(/\s+/);
    if (!classes.includes("bbcode-spoilerbox")) return;

    // Find the toggle link and body children
    const linkNode = node.children?.find(
        (c: any) => c.name === "a" && (c.attribs?.class || "").includes("bbcode-spoilerbox__link")
    );
    const bodyNode = node.children?.find(
        (c: any) => c.name === "div" && (c.attribs?.class || "").includes("bbcode-spoilerbox__body")
    );

    // Strip the icon span from the label so only text remains
    const labelChildren = linkNode?.children?.filter(
        (c: any) => !(c.name === "span" && (c.attribs?.class || "").includes("bbcode-spoilerbox__link-icon"))
    ) ?? [];

    const label = labelChildren.length ? domToReact(labelChildren, options) : "Spoiler";
    const body = bodyNode ? domToReact(bodyNode.children, options) : null;

    return <SpoilerBox label={label}>{body}</SpoilerBox>;
}

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
                    return <RLink to={`/beatmapset/${setId}/${mode}/${beatmapId}`}>{domToReact(node.children)}</RLink>;
                }
                return <RLink to={`/beatmapset/${setId}`}>{domToReact(node.children)}</RLink>;
            }
        }
    } catch(e) {
        // console.error("Error parsing beatmap link:", e);
        return;
    }
}

function isInsideSpoilerBox(node: any) {
    let parent = node.parent;
    while (parent) {
        const parentClasses = (parent.attribs?.class || "").split(/\s+/);
        if (parentClasses.includes("bbcode-spoilerbox")) return true;
        parent = parent.parent;
    }
    return false;
}

function replaceWellDiv(node: any, options: any) {
    if (node.name !== "div") return;

    const className = node.attribs?.class || "";
    const classes = className.split(/\s+/);

    if (!classes.includes("well")) return;

    // Don't wrap in Paper if it's already inside a spoilerbox (spoilerbox is the Paper)
    if (isInsideSpoilerBox(node)) {
        return <>{domToReact(node.children, options)}</>;
    }

    //count amount of parent wells/papers, elevation based on that
    let elevation = 1;
    let parent = node.parent;
    while (parent) {
        const parentClassName = parent.attribs?.class || "";
        const parentClasses = parentClassName.split(/\s+/);
        if (parentClasses.includes("well")) {
            elevation++;
        }
        parent = parent.parent;
    }

    return (
        <Paper elevation={elevation} sx={{ padding: 1, marginY: 1 }}>
            {domToReact(node.children, options)}
        </Paper>
    );
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
            //if url matches /users/{user_id} or /u/{user_id}
            const urlRegex = /https?:\/\/osu\.ppy\.sh\/(?:users|u)\/(\d+)/g;
            const match = urlRegex.exec(href);
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
                alignItems: 'center',
                verticalAlign: 'middle',
            }}
        ><PlayerLink data={users[userId]} size={18} /></Box>;
    }
}

function createReplaceHandler(users: any) {
    const options = {
        replace(node: any) {
            if (node.type !== "tag") return;

            return (
                replaceSpoilerBox(node, options) ||
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