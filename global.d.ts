import {Api} from "./app/services/api/api";

export declare global {
    interface Window {
        api: Api
    }
}
