import { Button, Paper, Typography } from "@mui/material";
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
                Please include your osu! username or ID so I can add the donator role to you on the site.
            </Typography>
        </Paper>
    )
}

export default IndexDonation;