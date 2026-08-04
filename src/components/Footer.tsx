import { AppBar, Box, Card, Toolbar, Typography, useTheme } from "@mui/material";
import Config from "../data/Config.json";
import type { IConfig } from "../types/types";
const typedConfig: IConfig = Config;
import { Link } from "react-router";

function Footer() {
    const theme = useTheme();
    return (
        <>
            <Box>
                <AppBar position="static" component={Card} sx={{
                    //no top border radius
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                }}>
                    <Toolbar>
                        <Typography>
                            Website made by Miorii
                        </Typography>
                        <Typography sx={{ ml: 1 }}>
                            <Link style={{ color: theme.palette.primary.main }} to={typedConfig.GITHUB_URL} target="_blank" rel="noopener noreferrer">Source Code</Link>
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    )
}

export default Footer;