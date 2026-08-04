import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

function DebouncedTextField({ value = "", delay = 500, onDebouncedChange, ...props}: { value?: string; delay?: number; onDebouncedChange?: (value: string) => void; [key: string]: any }) {
    const [internalValue, setInternalValue] = useState<string>(value || props?.defaultValue || "");

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