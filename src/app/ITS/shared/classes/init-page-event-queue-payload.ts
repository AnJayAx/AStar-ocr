import { InitPageEventType } from "../constants/constants";

export class InitPageEventQueuePayload {
    constructor(
        public type: InitPageEventType
    ){}
}