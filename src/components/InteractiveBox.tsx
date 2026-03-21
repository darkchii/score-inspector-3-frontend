import { useCallback, useRef, useState } from "react";

function InteractiveBox({ children = null, onClick = null, onLongPress = null, longPressDuration = 500, style = {}, className = "" }: {
    children?: React.ReactNode,
    onClick?: null | ((event: any) => void),
    onLongPress?: null | ((event: any) => void),
    longPressDuration?: number,
    style?: React.CSSProperties,
    className?: string
}) {
    const holdEvent = useLongPress((e: any) => {
        if (onLongPress) onLongPress(e);
    }, (e) => {
        if (onClick) onClick(e);
    }, { delay: longPressDuration });

    return (
        <div
            {...holdEvent}

            style={style}
            className={className}
        >
            {children}
        </div>
    );
}

export default InteractiveBox;


const useLongPress = (
    onLongPress: (event: any) => void,
    onClick: (event: any) => void,
    { shouldPreventDefault = true, delay = 300 } = {}
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<any>(null);
    const target = useRef<EventTarget | null>(null);

    const start = useCallback(
        (event: any) => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener("touchend", preventDefault, {
                    passive: false
                });
                target.current = event.target;
            }
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event: any, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            shouldTriggerClick && !longPressTriggered && onClick(event);
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", preventDefault);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => start(e),
        onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => start(e),
        onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => clear(e),
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => clear(e, false),
        onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => clear(e)
    };
};

const isTouchEvent = (event: any): event is TouchEvent => {
    return "touches" in event;
};

const preventDefault = (event: any) => {
    if (!isTouchEvent(event)) return;

    if (event.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};