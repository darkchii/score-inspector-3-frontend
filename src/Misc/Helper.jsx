import Config from '../Data/Config.json';
import { toast } from "react-toastify";
import { TextureDatabase } from '../Data/Textures/TextureDatabase';

export const ShowNotification = (message, severity) => {
    toast[severity](message, Config.NOTIFICATIONS);
};

export const FormatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
}

export const GetRulesetIconFromId = (rulesetId) => {
    switch (rulesetId) {
        default:
        case 0:
            return TextureDatabase.RulesetOsuIcon;
        case 1:
            return TextureDatabase.RulesetTaikoIcon;
        case 2:
            return TextureDatabase.RulesetCatchIcon;
        case 3:
            return TextureDatabase.RulesetManiaIcon;
    }
}