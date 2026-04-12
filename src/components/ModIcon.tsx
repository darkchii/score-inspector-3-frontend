import { GetModExtendedContent } from '../util/ModHelper';
import modStyles from '../styles/mod.module.less';
import ModTooltip from './tooltips/ModTooltip';
import { useState } from 'react';

function ModIcon({ mod, data, ruleset, size = null, disabled = false, interactive = false, onClick = null }: { mod?: any, data?: any, ruleset?: any, size?: number | null, disabled?: boolean, interactive?: boolean, onClick?: ((selected: boolean) => void) | null }) {
    const [isSelected, setIsSelected] = useState(false);

    if (!data) return null;

    const handleClick = () => {
        if (!interactive || disabled) return;
        const _isSelected = !isSelected; //states are delayed so can't rely on that
        setIsSelected(_isSelected);
        if (onClick) onClick(_isSelected);
    }

    const extendedData = GetModExtendedContent(mod);
    return (
        <ModTooltip
            mod={mod}
            data={data}
            ruleset={ruleset}>
            <div
                style={{
                    ...(size ? { '--mod-height': `${size}px` } : {})
                } as React.CSSProperties}
                className={`
                    ${modStyles.mod} 
                    ${modStyles[`mod--type-${data.Type}`]}`}
                data-name={data.Name}
                onClick={handleClick}>
                <div
                    className={`
                        ${modStyles.mod__icon} 
                        ${interactive && !disabled ? modStyles.mod__icon__hoverable : ''} 
                        ${disabled ? modStyles.mod__icon__disabled : ''}
                        ${isSelected ? modStyles.mod__icon__selected : ''}
                        ${modStyles[`mod__icon--${data.Acronym}`]}`}
                    data-acronym={data.Acronym}
                />
                {
                    extendedData ? <div className={modStyles.mod__extender}><span>{extendedData}</span></div> : null
                }
            </div>
        </ModTooltip>
    );
}

export default ModIcon;