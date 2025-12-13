import { GetModExtendedContent } from '../util/ModHelper';
import modStyles from '../styles/mod.module.less';
import ModTooltip from './tooltips/ModTooltip';

function Mod({ mod, data, ruleset }) {
    if (!data) return null;

    const extendedData = GetModExtendedContent(mod, data, ruleset);

    return (
        <ModTooltip mod={mod} data={data} ruleset={ruleset}>
            <div className={`${modStyles.mod} ${modStyles[`mod--type-${data.Type}`]}`} data-name={data.Name}>
                <div className={`${modStyles.mod__icon} ${modStyles[`mod__icon--${data.Acronym}`]}`} data-acronym={data.Acronym} />
                {
                    extendedData ? <div className={modStyles.mod__extender}><span>{extendedData}</span></div> : null
                }
            </div>
        </ModTooltip>
    );
}

export default Mod;