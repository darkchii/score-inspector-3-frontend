import Config from '../Data/Config.json';
import { toast } from "react-toastify";

export const ShowNotification = (message, severity) => {
    toast[severity](message, Config.NOTIFICATIONS);
};
