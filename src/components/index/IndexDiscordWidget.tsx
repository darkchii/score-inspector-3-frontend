import { Button } from "@mui/material";
import Config from "../../data/Config.json";
import React from "react";

function IndexDiscordWidget() {
    return (
        <React.Fragment>
            <Button
                variant="contained"
                color="primary"
                href={`${Config.DISCORD_URL}`}
                target="_blank"
                fullWidth
            >
                osu!alternative Discord
            </Button>
            <iframe
                src={`https://discord.com/widget?id=${Config.DISCORD_ID}&theme=dark`}
                width="100%"
                height="500"
                allowTransparency={true}
                style={{ border: 0 }}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
            </iframe>
        </React.Fragment>
    )
}

export default IndexDiscordWidget;