import { Box, Paper } from "@mui/material";

function ProfileHighlight({ title, value }) {
    return (
        <Paper elevation={3} sx={{ width: '100%', p: 1 }}>
            <Box>
                <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</Box>
                <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{title}</Box>
            </Box>
        </Paper >
    )
}

export default ProfileHighlight;