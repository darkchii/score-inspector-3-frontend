import { styled, Tooltip } from '@mui/material';

//use styled components
const LocalStyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
))(`
    background-color: rgba(0, 0, 0, 0.9);
    font-size: 18px;
    padding: 10px;
    font-weight: 400;
    max-width: 600px;
    `);

function BetterTooltip({ children, title, placement = 'bottom-start' }) {
    return (
        <LocalStyledTooltip
            title={title}
            placement={placement}
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [20, 20],
                            },
                        },
                    ],
                },
            }}
            followCursor>
            {children}
        </LocalStyledTooltip>
    )
}

export default BetterTooltip;