import { GetModExtendedContent } from '../Misc/ModHelper';
import modStyles from '../Style/mod.module.less';

function Mod({ mod, data }) {
    if (!data) return null;

    const extendedData = GetModExtendedContent(mod, data);

    return (
        <div className={`${modStyles.mod} ${modStyles[`mod--type-${data.Type}`]}`} title={data.Name}>
            <div className={`${modStyles.mod__icon} ${modStyles[`mod__icon--${data.Acronym}`]}`} data-acronym={data.Acronym} />
            {
                extendedData ? <div className={modStyles.mod__extender}><span>{extendedData}</span></div> : null
            }
        </div>
    );
}

export default Mod;