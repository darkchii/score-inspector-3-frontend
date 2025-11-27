import { Box, Button, Divider, IconButton } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import { TextureDatabase } from "../../Data/Textures/TextureDatabase";

function ProfileRulesetSelector() {
    const { activeRuleset, setActiveRuleset } = useProfile();

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton key={'ruleset_osu'} onClick={() => setActiveRuleset('osu')} color={activeRuleset === 'osu' ? "primary" : "default"} title="osu!">
                    <img
                        src={TextureDatabase.RulesetOsuIcon}
                        alt="osu!"
                        width={24}
                        height={24}
                        style={{
                            //png is white, so we need to darken it when not active
                            filter: activeRuleset === 'osu' ? 'none' : 'grayscale(100%)',
                        }}
                    />
                </IconButton>
                <IconButton key={'ruleset_taiko'} onClick={() => setActiveRuleset('taiko')} color={activeRuleset === 'taiko' ? "primary" : "default"} title="Taiko">
                    <img src={TextureDatabase.RulesetTaikoIcon} alt="Taiko" width={24} height={24} />
                </IconButton>
                <IconButton key={'ruleset_fruits'} onClick={() => setActiveRuleset('fruits')} color={activeRuleset === 'fruits' ? "primary" : "default"} title="Catch the Beat">
                    <img src={TextureDatabase.RulesetCatchIcon} alt="Catch the Beat" width={24} height={24} />
                </IconButton>
                <IconButton key={'ruleset_mania'} onClick={() => setActiveRuleset('mania')} color={activeRuleset === 'mania' ? "primary" : "default"} title="Mania">
                    <img src={TextureDatabase.RulesetManiaIcon} alt="Mania" width={24} height={24} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton key={'ruleset_combined'} onClick={() => setActiveRuleset('all')} color={activeRuleset === 'all' ? "primary" : "default"} title="All Rulesets">
                    {/* show a combination of the four ruleset icons, show a corner of each */}
                    <div style={{ position: 'relative', width: 24, height: 24 }}>
                        <img
                            src={TextureDatabase.RulesetOsuIcon}
                            alt="osu!"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetTaikoIcon}
                            alt="Taiko"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, right: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetCatchIcon}
                            alt="Catch the Beat"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', bottom: 0, left: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetManiaIcon}
                            alt="Mania"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', bottom: 0, right: 0 }}
                        />
                    </div>
                </IconButton>
            </Box>
        </>
    )
}

export default ProfileRulesetSelector;