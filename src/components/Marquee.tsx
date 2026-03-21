function Marquee({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'inline-block', paddingLeft: '100%', animation: 'marquee 15s linear infinite' }}>
                {children}
            </div>
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }
                `}
            </style>
        </div>
    );
}

export default Marquee;