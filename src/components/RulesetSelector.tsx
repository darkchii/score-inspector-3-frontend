import { Box, Divider, Fade, IconButton, useTheme } from "@mui/material";
import BetterTooltip from "./tooltips/BetterTooltip";
import { GetRulesetColor, GetRulesets } from "../util/Helper";
import { TextureDatabase } from "../assets/textures/TextureDatabase";
import { grey } from "@mui/material/colors";

function RulesetSelector(
    { activeRuleset, onChange, disabled = false, availableRulesets = ['osu', 'taiko', 'fruits', 'mania'], showCombined = true }: {
        activeRuleset: string,
        onChange: (ruleset: string) => void,
        disabled?: boolean,
        availableRulesets?: string[],
        showCombined?: boolean,
    }) {
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {
                    GetRulesets().map((ruleset) => (
                        <BetterTooltip title={!availableRulesets.includes(ruleset.name) ? "No scores available for this ruleset" : ruleset.displayName}>
                            <Box key={`ruleset_${ruleset.id}`} sx={{ position: 'relative' }}>
                                {/* arrow below indicator, pointing down, colored with GetRulesetColor */}
                                <Fade in={activeRuleset === ruleset.name} unmountOnExit>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -6,
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
                                    onClick={() => availableRulesets.includes(ruleset.name) && onChange(ruleset.name)}
                                    className={activeRuleset === ruleset.name ? "profile-selected-ruleset" : ""}
                                    disabled={!availableRulesets.includes(ruleset.name) || disabled}
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
                        </BetterTooltip>
                    ))
                }
                {
                    showCombined && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            <BetterTooltip title="All rulesets combined">
                                <IconButton
                                    key={'ruleset_combined'}
                                    onClick={() => onChange('all')}
                                    className={activeRuleset === 'all' ? "profile-selected-ruleset" : ""}
                                    disabled={disabled}
                                >
                                    {/* show a combination of the four ruleset icons, show a corner of each */}
                                    <div style={{
                                        position: 'relative',
                                        width: 24,
                                        height: 24,
                                    }}>
                                        <Fade in={activeRuleset === 'all'} unmountOnExit>
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
                                                    borderBottom: `8px solid ${grey[500]}`,
                                                    //glow
                                                    filter: `drop-shadow(0 0 4px ${grey[500]})`,
                                                }}
                                            />
                                        </Fade>
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
                            </BetterTooltip>
                        </>
                    )
                }
            </Box>
        </>
    )
}

export default RulesetSelector;