import { Avatar, Box, Button, Divider, Paper, Typography } from "@mui/material";
import Config from "../../data/Config.json";

function IndexDonation() {
    return (
        <Paper sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
        }}>
            <Button variant="contained" color="primary" href={Config.PAYPAL_DONATION_URL} target="_blank" rel="noopener noreferrer">
                Donate
            </Button>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
                Donations keep the site and me alive and help cover server costs. Any amount is appreciated!
            </Typography>
            <Typography variant="caption" sx={{ marginTop: 1 }}>
                Please include your osu! username or ID so I can add the donator role to you on the site. (This is separate from the Discord!)
            </Typography>
            <Divider sx={{ marginY: 2, width: '100%' }} />
            <Typography variant="body2">Website created by</Typography>
            <Box
                component="a"
                href="https://osu.ppy.sh/users/10153735"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    marginTop: 1,
                }}>
                <Avatar
                    alt="Alya Kujou"
                    src="https://a.ppy.sh/10153735"
                    sx={{ width: 56, height: 56 }}
                />
                <Typography variant="body1" sx={{ marginLeft: 1 }}>
                    Alya Kujou
                </Typography>
            </Box>
        </Paper>
    )
}

export default IndexDonation;