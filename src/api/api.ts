import {MessageContext} from 'vk-io';
import {currentSentMessages, increaseSentMessages, TAG, TAG_ERROR, vk} from '../index';
import {LoadManager} from './load-manager';
import {SettingsStorage} from '../database/settings-storage';
import {Utils} from '../util/utils';
import {Message} from '../model/message';

export class Api {

    static async removeChatUser(chatId: number, userId: number): Promise<any> {
        return new Promise((resolve, reject) => vk.api.messages.removeChatUser({
            chat_id: chatId,
            user_id: userId
        }).catch(reject).then(resolve));
    }

    static async sendMessage(context: MessageContext, message?: string, disableMentions?: boolean,
                             replyTo?: number, keyboard?: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const params = {
                peer_id: context.peerId,
                random_id: Utils.getRandomInt(10000)
            };

            if (message) params['message'] = message;
            if (disableMentions) params['disable_mentions'] = disableMentions ? 1 : 0;
            if (replyTo) params['reply_to'] = replyTo;
            if (keyboard) params['keyboard'] = keyboard;

            vk.api.messages.send(params).catch(reject).then((id) => {
                    // @ts-ignore
                    resolve(id);

                    increaseSentMessages();
                }
            );
        });
    }

    static async editMessage(context: MessageContext, newText: string): Promise<boolean> {
        return new Promise(((resolve, reject) => {
            const params = {
                peer_id: context.peerId,
                conversation_message_id: context.conversationMessageId,
                message: newText
            };

            vk.api.messages.edit(params).catch(e => {
                console.error(`${TAG_ERROR}: ${Utils.getExceptionText(e)}`);
                resolve(false);
            }).then((response) => {
                if (response == 1) resolve(true);
                else reject(false);
            });
        }));
    }

    static async replyMessage(context: MessageContext, message: string, keyboard?: string): Promise<number> {
        return this.sendMessage(context, message, true, context.id, keyboard);
    }

    static async changeChatTitle(context: MessageContext, title: string): Promise<any> {
        return new Promise((resolve, reject) => {
            vk.api.messages.editChat({chat_id: context.chatId, title: title}).catch(reject).then(resolve);
        });
    }

}