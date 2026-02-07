import Config from "../../data/Config.json";

function IndexDiscordWidget() {
    return (
        <iframe
            src={`https://discord.com/widget?id=${Config.DISCORD_ID}&theme=dark`}
            width="100%"
            height="500"
            allowtransparency="true"
            frameborder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts">
        </iframe>
    )
}

export default IndexDiscordWidget;