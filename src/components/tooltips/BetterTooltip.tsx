import { styled, Tooltip, tooltipClasses } from '@mui/material';
import type { TooltipProps } from '@mui/material';
import { isValidElement } from 'react';

//use styled components
const LocalStyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        fontSize: '18px',
        padding: '10px',
        fontWeight: 400,
        maxWidth: '600px',
    },
});

type BetterTooltipProps = Omit<TooltipProps, 'children'> & {
    children: React.ReactNode;
};

function BetterTooltip({ children, title, placement = 'bottom-start', arrow = false, disableInteractive = true }: BetterTooltipProps) {
    const tooltipChild = isValidElement(children) ? children : <span>{children}</span>;

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
            arrow={arrow}
            disableInteractive={disableInteractive}
            followCursor>
            {tooltipChild}
        </LocalStyledTooltip>
    )
}

export default BetterTooltip;