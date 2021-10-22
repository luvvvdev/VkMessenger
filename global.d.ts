import {Api} from "./app/services/api/api";
import {LongPollService} from "./app/services/LongPoll";

export declare global {
    interface Window {
        api: Api
        lp: LongPollService
        lp_started: boolean
    }
}
