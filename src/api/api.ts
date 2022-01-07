import {MessageContext} from 'vk-io';
import {TAG_ERROR, vk} from '../index';
import {Utils} from '../util/utils';
import {StorageManager} from '../database/storage-manager';
import {MessagesEditParams} from 'vk-io/lib/api/schemas/params';

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
                random_id: 0
            };

            if (message) params['message'] = message;
            if (disableMentions) params['disable_mentions'] = disableMentions ? 1 : 0;
            if (replyTo) params['reply_to'] = replyTo;
            if (keyboard) params['keyboard'] = keyboard;

            vk.api.messages.send(params).then((id) => {
                    resolve(id);

                    StorageManager.increaseSentMessagesCount();
                }
            ).catch(reject);
        });
    }

    static async editMessage(peerId: number, conversationMessageId: number, newText: string): Promise<boolean> {
        return new Promise(((resolve, reject) => {
            const params: MessagesEditParams = {
                peer_id: peerId,
                conversation_message_id: conversationMessageId,
                message: newText
            };

            vk.api.messages.edit(params).then((response) => {
                if (response == 1) resolve(true);
                else reject(false);
            }).catch(e => {
                console.error(`${TAG_ERROR}: ${Utils.getExceptionText(e)}`);
                resolve(false);
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