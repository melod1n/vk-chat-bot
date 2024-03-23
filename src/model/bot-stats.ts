export class BotStats {
    receivedCount: number;
    sentCount: number;

    constructor(receivedCount: number, sentCount: number) {
        this.receivedCount = receivedCount;
        this.sentCount = sentCount;
    }
}