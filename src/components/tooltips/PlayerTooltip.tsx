import { Avatar, styled, Tooltip, tooltipClasses } from "@mui/material";
import type { TooltipProps } from "@mui/material";
import { isValidElement } from "react";
import { getFlagIcon } from "../../assets/textures/TextureDatabase";

//use styled components
const LocalStyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        fontSize: '18px',
        fontWeight: 400,
        backdropFilter: 'blur(4px)',
        minWidth: '200px',
        maxWidth: '400px',
        height: '80px',
        padding: '0px',
    },
});

type PlayerTooltipProps = {
    data: any;
    children: React.ReactNode;
};

function PlayerTooltip({ data, children }: PlayerTooltipProps) {
    const tooltipChild = isValidElement(children) ? children : <span>{children}</span>;

    return (
        <LocalStyledTooltip
            title={<>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                }}>
                    <Avatar
                        src={data?.osuApi?.avatar_url || ''}
                        alt={data?.osuApi?.username || 'Avatar'}
                        sx={{
                            //fit height, always square
                            height: '100%',
                            width: 'auto',
                            borderRadius: '4px',
                            mr: 1,
                        }}
                    />
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingRight: 8,
                    }}>
                        <div style={{
                            //center vertically
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                        }}>
                            {
                                data?.team && <>
                                    <img src={data.team.flag_url} alt={data.team.short_name}
                                        style={{
                                            height: 24,
                                            width: 'auto',
                                            borderRadius: '2px',
                                            marginRight: 4,
                                        }}
                                    />
                                    <span style={{ color: data.team.color, fontWeight: 'bold', marginRight: 4 }}>[{data.team.short_name}]</span>
                                </>
                            }
                            {/* {data?.osuApi?.username || 'Unknown'} */}
                            {
                                data?.osuApi?.username ? <span>{data.osuApi.username}</span> : <span style={{ fontStyle: 'italic' }}>Unknown</span>
                            }
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                        }}>
                            {/* country flag */}
                            <img
                                src={getFlagIcon(data?.osuApi?.country_code) || ''} alt={data?.osuApi?.country_code}
                                style={{
                                    height: 24,
                                    width: 'auto',
                                }}
                            />
                            <span style={{ marginLeft: 8 }}>{data?.osuApi?.country?.name || 'Unknown Country'}</span>
                        </div>
                    </div>
                </div>
            </>}
            placement={'top'}
            followCursor
            >
            {tooltipChild}
        </LocalStyledTooltip>
    )
}

export default PlayerTooltip;