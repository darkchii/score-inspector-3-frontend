import { Button, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography } from "@mui/material";
import { useApi } from "../../providers/ApiProvider";
import { useEffect, useState } from "react";
import LandingCard from "../LandingCard";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { red, yellow } from "@mui/material/colors";
import PlayerLink from "../PlayerLink";
import { TimeAgo } from "../../util/Helper";
import GroupAddIcon from '@mui/icons-material/GroupAdd';

function IndexRecentVisitors() {
    const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
    const { getRecentVisitors } = useApi();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchRecentVisitors = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await getRecentVisitors();
                setRecentVisitors(response || []);
            } catch (error) {
                setIsError(true);
                console.error("Error fetching recent visitors:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecentVisitors();
    }, []);
    return (
        <LandingCard
            title="Recent Visits"
            isLoading={isLoading}
            isError={isError}
            icon={<GroupAddIcon />}
            color={yellow[500]}
            centerContent
            sx={{ height: '100%', width: '100%' }}
        >
            {recentVisitors.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No recent visitors</Typography>
            ) : (
                <TableContainer>
                    <Table size="small" sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                            color: 'white !important',
                            padding: '2px'
                        },
                        [`& .${tableRowClasses.root}`]: {
                            borderBottom: "none",
                        },
                    }}>
                        <TableBody>
                            {
                                recentVisitors.map((visitor, index) => (
                                    <TableRow key={`recentVisitor_${index}`}>
                                        <TableCell align="right" sx={{ width: '10%' }}><Typography variant="caption">{index + 1}.</Typography></TableCell>
                                        <TableCell><PlayerLink data={visitor.user} size={18} /></TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{TimeAgo(visitor.last_visited)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </LandingCard>
    )
}

export default IndexRecentVisitors;