/* eslint-disable no-async-promise-executor,@typescript-eslint/no-inferrable-types */
import {MessageContext} from "vk-io";
import {TAG_ERROR, vk} from "../index";
import {Utils} from "../util/utils";
import {MessagesEditParams, MessagesSendParams} from "vk-io/lib/api/schemas/params";
import {incrementSentMessages} from "../commands/stats";

export class Api {

    static async removeChatUser(chatId: number, userId: number): Promise<unknown> {
        return new Promise((resolve, reject) => vk.api.messages.removeChatUser({
            chat_id: chatId,
            user_id: userId
        }).catch(reject).then(resolve));
    }

    static async sendMessage(
        context: MessageContext,
        message?: string,
        disableMentions: boolean = true,
        keyboard?: string
    ): Promise<MessageContext> {
        const params: MessagesSendParams = {disable_mentions: disableMentions};

        if (keyboard) params["keyboard"] = keyboard;

        return new Promise(async (resolve, reject) => {
            context.send(message, params).then(r => {
                incrementSentMessages();
                resolve(r);
            }).catch(reject);
        });
    }

    static async replyMessage(
        context: MessageContext,
        message?: string,
        disableMentions: boolean = true,
        keyboard?: string
    ): Promise<MessageContext> {
        const params: MessagesSendParams = {disable_mentions: disableMentions};

        if (keyboard) params["keyboard"] = keyboard;

        return new Promise(async (resolve, reject) => {
            context.reply(message, params).then(r => {
                incrementSentMessages();
                resolve(r);
            }).catch(reject);
        });
    }

    static async editMessage(
        context: MessageContext,
        newText: string,
        disableMentions: boolean = true,
        keyboard?: string
    ): Promise<boolean> {
        return new Promise(((resolve, reject) => {
            const params: MessagesEditParams = {
                peer_id: context.peerId,
                message: newText,
                disable_mentions: disableMentions
            };

            if (keyboard) params["keyboard"] = keyboard;

            context.editMessage(params).then(r => {
                if (r == 1) resolve(true);
                else reject(false);
            }).catch(e => {
                console.error(`${TAG_ERROR}: ${Utils.getExceptionText(e)}`);
                resolve(false);
            });
        }));
    }


    static async changeChatTitle(context: MessageContext, title: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            vk.api.messages.editChat({chat_id: context.chatId, title: title}).catch(reject).then(resolve);
        });
    }

    static async deleteMessage(context: MessageContext, deleteForAll: boolean = true): Promise<boolean> {
        return new Promise((resolve, reject) => {
            context.deleteMessage({delete_for_all: deleteForAll}).then(resolve).catch(reject);

            // await vk.api.messages.delete({
            //     peer_id: peerId,
            //     conversation_message_ids: [conversationMessageId],
            //     delete_for_all: deleteForAll
            // }).then(resolve).catch(reject);
        });
    }
}