import { AppBar, Box, Card, Toolbar, Typography } from "@mui/material";

function Footer() {
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
                            Website made by Amayakase
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    )
}

export default Footer;