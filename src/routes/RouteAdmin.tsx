import { Alert, Box, CircularProgress, Link as MuiLink, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePageTitle } from "../providers/TitleProvider";
import { useAuth } from "../providers/AuthProvider";
import { useApi } from "../providers/ApiProvider";
import { GenerateUrl, routeData } from "../util/RouteHelper";

const EDITOR_ROLE_ID = 5;
const DEFAULT_ADMIN_TAB = "beatmaps";
const DEFAULT_FILTER_TAB = "incomplete";

interface IAdminMediaField {
    key: string;
    label: string;
    column: string;
}

interface IAdminMediaFilter {
    key: string;
    label: string;
    count: number;
}

interface IAdminMediaRow {
    beatmapset_id: number;
    title: string | null;
    artist: string | null;
    mapper: string | null;
    mapper_id: number | null;
    ranked_raw: number | null;
    beatmap_count: number;
    has_media_entry: boolean;
    present_media_keys: string[];
    missing_media_keys: string[];
    media_values: Record<string, string | null>;
}

interface IAdminMediaAuditResponse {
    limit: number;
    media_fields: IAdminMediaField[];
    filters: IAdminMediaFilter[];
    rows_by_filter: Record<string, IAdminMediaRow[]>;
}

function hasEditorAccess(userData: any): boolean {
    if (!userData?.roles || !Array.isArray(userData.roles)) {
        return false;
    }

    return userData.roles.some((role: any) => {
        const title = (role?.title || "").toString().toLowerCase();
        return role?.id === EDITOR_ROLE_ID || role?.role_id === EDITOR_ROLE_ID || title === "editor" || role?.is_editor === true || role?.is_admin === true;
    });
}

function RouteAdmin() {
    const { tab } = useParams<{ tab?: string }>();
    const navigate = useNavigate();
    const { token, userData, loading } = useAuth();
    const { getBeatmapMediaAudit } = useApi();
    const [activeFilter, setActiveFilter] = useState<string>(DEFAULT_FILTER_TAB);
    const [auditData, setAuditData] = useState<IAdminMediaAuditResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    usePageTitle("Admin");

    useEffect(() => {
        if (tab === DEFAULT_ADMIN_TAB) {
            return;
        }

        navigate(GenerateUrl(routeData.routeAdmin.path, { tab: DEFAULT_ADMIN_TAB }), { replace: true });
    }, [tab, navigate]);

    useEffect(() => {
        if (loading || !token || !hasEditorAccess(userData)) {
            return;
        }

        (async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getBeatmapMediaAudit(token, 100);
                setAuditData(response);

                const availableFilters = response?.filters || [];
                setActiveFilter((currentFilter) => (
                    availableFilters.some((filter: IAdminMediaFilter) => filter.key === currentFilter)
                        ? currentFilter
                        : (availableFilters[0]?.key || DEFAULT_FILTER_TAB)
                ));
            } catch (fetchError) {
                console.error("Failed to load beatmap media audit:", fetchError);
                setError(fetchError instanceof Error ? fetchError.message : "Failed to load beatmap media audit.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [getBeatmapMediaAudit, loading, token, userData]);

    const filters = auditData?.filters || [];
    const mediaFields = auditData?.media_fields || [];
    const activeFilterData = filters.find((filter) => filter.key === activeFilter) || filters[0] || null;
    const mediaFieldLabels = mediaFields.reduce<Record<string, string>>((accumulator, field) => {
        accumulator[field.key] = field.label;
        return accumulator;
    }, {});

    const rows = (auditData?.rows_by_filter?.[activeFilterData?.key || DEFAULT_FILTER_TAB] || []).map((row) => {
        const mediaValues = mediaFields.reduce<Record<string, string>>((accumulator, field) => {
            accumulator[`media_${field.key}`] = row.media_values?.[field.key] || "Missing";
            return accumulator;
        }, {});

        return {
            id: row.beatmapset_id,
            ...row,
            media_entry_label: row.has_media_entry ? "Yes" : "No",
            missing_count: row.missing_media_keys.length,
            missing_summary: row.missing_media_keys.map((key) => mediaFieldLabels[key] || key).join(", "),
            present_summary: row.present_media_keys.map((key) => mediaFieldLabels[key] || key).join(", ") || "None",
            ...mediaValues,
        };
    });

    const columns: GridColDef[] = [
        {
            field: "beatmapset_id",
            headerName: "Beatmapset",
            minWidth: 130,
            renderCell: (params) => (
                <MuiLink component={Link} to={GenerateUrl(routeData.routeBeatmapsets.path, { beatmapsetId: params.row.beatmapset_id })} underline="hover">
                    #{params.row.beatmapset_id}
                </MuiLink>
            )
        },
        {
            field: "artist",
            headerName: "Artist",
            minWidth: 180,
            flex: 0.8,
        },
        {
            field: "title",
            headerName: "Title",
            minWidth: 220,
            flex: 1,
        },
        {
            field: "mapper",
            headerName: "Mapper",
            minWidth: 160,
            flex: 0.7,
            valueGetter: (_value, row) => row.mapper || "Unknown",
        },
        {
            field: "beatmap_count",
            headerName: "Maps",
            minWidth: 90,
            type: "number",
        },
        {
            field: "media_entry_label",
            headerName: "Media Entry",
            minWidth: 120,
        },
        {
            field: "missing_count",
            headerName: "Missing",
            minWidth: 90,
            type: "number",
        },
        {
            field: "missing_summary",
            headerName: "Missing Fields",
            minWidth: 180,
            flex: 0.8,
            valueGetter: (_value, row) => row.missing_summary || "None",
        },
        {
            field: "present_summary",
            headerName: "Present Fields",
            minWidth: 180,
            flex: 0.8,
        },
        ...mediaFields.map<GridColDef>((field) => ({
            field: `media_${field.key}`,
            headerName: field.label,
            minWidth: 180,
            flex: 0.9,
        }))
    ];

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!token) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="warning">You need to sign in to access the admin area.</Alert>
            </Box>
        );
    }

    if (!hasEditorAccess(userData)) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">Editor access is required for the admin area.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 2 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h4">Admin</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Beatmap media audit shows beatmapsets with missing media rows or missing provider IDs. Each filter is capped at {auditData?.limit || 100} rows and remains sortable in the table.
                        </Typography>
                    </Box>

                    <Tabs value={DEFAULT_ADMIN_TAB}>
                        <Tab value={DEFAULT_ADMIN_TAB} label="Beatmaps" />
                    </Tabs>

                    {error && <Alert severity="error">{error}</Alert>}

                    {!error && (
                        <>
                            <Tabs
                                value={activeFilterData?.key || DEFAULT_FILTER_TAB}
                                onChange={(_event, value) => setActiveFilter(value)}
                                variant="scrollable"
                                allowScrollButtonsMobile
                            >
                                {filters.map((filter) => (
                                    <Tab key={filter.key} value={filter.key} label={`${filter.label} (${filter.count})`} />
                                ))}
                            </Tabs>

                            <Typography variant="body2" color="text.secondary">
                                Showing {rows.length} of {activeFilterData?.count || 0} matches for {activeFilterData?.label || "this filter"}.
                            </Typography>

                            <DataGrid
                                autoHeight
                                rows={rows}
                                columns={columns}
                                disableRowSelectionOnClick
                                pageSizeOptions={[25, 50, 100]}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            page: 0,
                                            pageSize: 25,
                                        }
                                    },
                                    sorting: {
                                        sortModel: [
                                            { field: "missing_count", sort: "desc" },
                                            { field: "beatmapset_id", sort: "asc" },
                                        ]
                                    }
                                }}
                                sx={{
                                    minHeight: 560,
                                    border: 0,
                                    "& .MuiDataGrid-columnHeaders": {
                                        borderBottom: 1,
                                        borderColor: "divider",
                                    }
                                }}
                            />
                        </>
                    )}

                    {isLoading && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

export default RouteAdmin;