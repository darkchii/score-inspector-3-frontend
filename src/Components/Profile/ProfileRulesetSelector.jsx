import { Box, Button, Divider, Fade, IconButton, Tooltip, useTheme } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import { TextureDatabase } from "../../Assets/Textures/TextureDatabase";
import { GetRulesetColor, GetRulesets } from "../../Misc/Helper";
import { grey } from "@mui/material/colors";

function ProfileRulesetSelector() {
    const { activeRuleset, setActiveRuleset, availableRulesets } = useProfile();
    const theme = useTheme();

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {
                    GetRulesets().map((ruleset) => (
                        <Tooltip title={!availableRulesets.includes(ruleset.name) ? "No scores available for this ruleset" : ruleset.displayName}>
                            <Box key={`ruleset_${ruleset.id}`} sx={{ position: 'relative' }}>
                                {/* arrow below indicator, pointing down, colored with GetRulesetColor */}
                                <Fade in={activeRuleset === ruleset.name} unmountOnExit>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -10,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderBottom: `8px solid ${GetRulesetColor(ruleset.name)[500]}`,
                                            //glow
                                            filter: `drop-shadow(0 0 4px ${GetRulesetColor(ruleset.name)[500]})`,
                                        }}
                                    />
                                </Fade>
                                {/* icon/button */}
                                <IconButton
                                    onClick={() => availableRulesets.includes(ruleset.name) && setActiveRuleset(ruleset.name)}
                                    className={activeRuleset === ruleset.name ? "profile-selected-ruleset" : ""}
                                    title={ruleset.displayName}
                                    disabled={!availableRulesets.includes(ruleset.name)}
                                >
                                    <img
                                        className="profile-ruleset-icon"
                                        src={ruleset.icon}
                                        alt={ruleset.displayName}
                                        width={24}
                                        height={24}
                                        style={{
                                            //if disabled, scale it 0.6
                                            transform: !availableRulesets.includes(ruleset.name) ? 'scale(0.6)' : 'scale(1)',
                                            //filter color to primary if selected
                                            filter: activeRuleset === ruleset.name ? `drop-shadow(0 0 4px ${GetRulesetColor(ruleset.name)[500]})` : 'none',
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        </Tooltip>
                    ))
                }
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton key={'ruleset_combined'} onClick={() => setActiveRuleset('all')} className={activeRuleset === 'all' ? "profile-selected-ruleset" : ""} title="All Rulesets">
                    {/* show a combination of the four ruleset icons, show a corner of each */}
                    <div style={{
                        position: 'relative',
                        width: 24,
                        height: 24,
                    }}>
                        <img
                            src={TextureDatabase.RulesetOsuIcon}
                            alt="osu!"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, left: 0, filter: activeRuleset === 'all' ? `drop-shadow(0 0 4px ${GetRulesetColor('osu')[500]})` : 'none', }}
                        />
                        <img
                            src={TextureDatabase.RulesetTaikoIcon}
                            alt="Taiko"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', top: 0, right: 0, filter: activeRuleset === 'all' ? `drop-shadow(0 0 4px ${GetRulesetColor('taiko')[500]})` : 'none', }}
                        />
                        <img
                            src={TextureDatabase.RulesetCatchIcon}
                            alt="Catch the Beat"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', bottom: 0, left: 0, filter: activeRuleset === 'all' ? `drop-shadow(0 0 4px ${GetRulesetColor('fruits')[500]})` : 'none', }}
                        />
                        <img
                            src={TextureDatabase.RulesetManiaIcon}
                            alt="Mania"
                            className="profile-ruleset-icon"
                            width={12}
                            height={12}
                            style={{ position: 'absolute', bottom: 0, right: 0, filter: activeRuleset === 'all' ? `drop-shadow(0 0 4px ${GetRulesetColor('mania')[500]})` : 'none', }}
                        />
                    </div>
                </IconButton>
            </Box>
        </>
    )
}

export default ProfileRulesetSelector;