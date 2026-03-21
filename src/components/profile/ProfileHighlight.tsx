import { Box, Paper } from "@mui/material";
import { JSX } from "react";

function ProfileHighlight({ title, value }: {
    title: string,
    value: string | number | JSX.Element
}) {
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