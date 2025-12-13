import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

function DebouncedTextField({ value = "", delay = 500, onDebouncedChange, ...props}) {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (onDebouncedChange) {
                onDebouncedChange(internalValue);
            }
        }, delay);  
        return () => {
            clearTimeout(handler);
        }
    }, [internalValue, delay, onDebouncedChange]);

    return (
        <TextField
            {...props}
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
        />
    );
}

export default DebouncedTextField;