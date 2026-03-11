import { useCallback, useRef, useState } from "react";

function InteractiveBox({ children = null, onClick = null, onLongPress = null, longPressDuration = 500, style = {}, className = "" }) {
    
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
        onMouseDown: e => start(e),
        onTouchStart: e => start(e),
        onMouseUp: e => clear(e),
        onMouseLeave: e => clear(e, false),
        onTouchEnd: e => clear(e)
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