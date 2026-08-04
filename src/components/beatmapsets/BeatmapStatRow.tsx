import { LinearProgress, TableCell, TableRow, Typography } from "@mui/material";

function BeatmapStatRow({ label, value, limit = 10, enabled = true }: { label: string, value: number, limit?: number, enabled?: boolean }) {
    if (!enabled) {
        return null;
    }

    return (
        <TableRow>
            <TableCell><Typography variant="body2" color="text.secondary">{label}</Typography></TableCell>
            <TableCell>{value}</TableCell>
            <TableCell sx={{ width: '100%' }}>
                <LinearProgress
                    variant="determinate"
                    value={typeof value === 'number' ? Math.min((value / limit) * 100, 100) : 0}
                />
            </TableCell>
        </TableRow>
    )
}

export default BeatmapStatRow;