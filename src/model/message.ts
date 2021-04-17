export class Message {

    messageId: number;
    peerId: number;
    fromId: number;
    date: number;
    isOut: boolean;
    text: string;
    randomId: number;
    fwdMessages?: Message[];
    attachments?: any[];
    replyMessage?: Message;

    constructor(json = null) {
        if (json) {
            this.messageId = json.id;
            this.peerId = json.peer_id;
            this.fromId = json.from_id;
            this.date = json.date;
            this.isOut = json.out;
            this.text = json.text;
            this.randomId = json.random_id;

            this.fwdMessages = json.fwdMessages;
            this.attachments = json.attachments;

            this.replyMessage = new Message(json.reply_message);
        }
    }

    static parse(array): Message[] {
        const messages: Message[] = [];

        for (let i = 0; i < array.length; i++) {
            messages.push(new Message(array[i]));
        }

        return messages;
    }


}