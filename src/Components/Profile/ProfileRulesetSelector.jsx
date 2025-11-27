import { Box, Button, Divider, IconButton } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import { TextureDatabase } from "../../Data/Textures/TextureDatabase";

function ProfileRulesetSelector() {
    const { activeRuleset, setActiveRuleset } = useProfile();

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton key={'ruleset_osu'} onClick={() => setActiveRuleset('osu')} className={activeRuleset === 'osu' ? "profile-selected-ruleset" : ""} title="osu!">
                    <img className="profile-ruleset-icon" src={TextureDatabase.RulesetOsuIcon} alt="osu!" width={24} height={24} />
                </IconButton>
                <IconButton key={'ruleset_taiko'} onClick={() => setActiveRuleset('taiko')} className={activeRuleset === 'taiko' ? "profile-selected-ruleset" : ""} title="Taiko">
                    <img className="profile-ruleset-icon" src={TextureDatabase.RulesetTaikoIcon} alt="Taiko" width={24} height={24} />
                </IconButton>
                <IconButton key={'ruleset_fruits'} onClick={() => setActiveRuleset('fruits')} className={activeRuleset === 'fruits' ? "profile-selected-ruleset" : ""} title="Catch the Beat">
                    <img className="profile-ruleset-icon" src={TextureDatabase.RulesetCatchIcon} alt="Catch the Beat" width={24} height={24} />
                </IconButton>
                <IconButton key={'ruleset_mania'} onClick={() => setActiveRuleset('mania')} className={activeRuleset === 'mania' ? "profile-selected-ruleset" : ""} title="Mania">
                    <img className="profile-ruleset-icon" src={TextureDatabase.RulesetManiaIcon} alt="Mania" width={24} height={24} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton key={'ruleset_combined'} onClick={() => setActiveRuleset('all')} className={activeRuleset === 'all' ? "profile-selected-ruleset" : ""} title="All Rulesets">
                    {/* show a combination of the four ruleset icons, show a corner of each */}
                    <div style={{ position: 'relative', width: 24, height: 24 }}>
                        <img
                            src={TextureDatabase.RulesetOsuIcon}
                            alt="osu!"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetTaikoIcon}
                            alt="Taiko"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, right: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetCatchIcon}
                            alt="Catch the Beat"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', bottom: 0, left: 0 }}
                        />
                        <img
                            src={TextureDatabase.RulesetManiaIcon}
                            alt="Mania"
                            className="profile-ruleset-icon"
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