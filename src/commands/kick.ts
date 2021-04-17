import {Command, Requirements} from '../model/chat-command';
import {Api} from '../api/api';
import {LoadManager} from '../api/load-manager';
import {Message} from '../model/message';

export class Kick extends Command {
    regexp = /^\/kick/i;
    title = '/kick [reply]';
    name = '/kick';
    description = 'кикает участника беседы';

    requirements = Requirements.builder().apply(false, true, true, true, false, true);

    async execute(context) {
        LoadManager.loadMessageByConversationMessageId(context.peerId, context.replyMessage.conversationMessageId).catch(console.error).then(r => {
            const message = <Message>r;

            if (Math.abs(message.fromId) === globalThis.id) {
                console.log(`${this.title}: fromId is bad`);

                Api.replyMessage(context, 'Нет.');
                return;
            }

            Api.removeChatUser(context.chatId, message.fromId).catch(console.error);
        });
    }

}