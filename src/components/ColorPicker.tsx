import { useEffect, useState } from "react";

function ColorPicker({ color, onChange }: { color: string; onChange: (newColor: string) => void }) {
    const [internalColor, setInternalColor] = useState(color);

    useEffect(() => {
        setInternalColor(color);
    }, [color]);

    //Advaned Material design styled color picker
    return (
        <input
            type="color"
            value={internalColor}
            onChange={(e) => {
                setInternalColor(e.target.value);
                onChange(e.target.value);
            }}
            style={{ width: "100%", height: "40px", border: "none", padding: 0, margin: 0, cursor: "pointer" }}
        />
    );
};

export default ColorPicker;