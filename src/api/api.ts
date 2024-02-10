/* eslint-disable no-async-promise-executor,@typescript-eslint/no-inferrable-types */
import {MessageContext} from "vk-io";
import {TAG_ERROR, vk} from "../index";
import {Utils} from "../util/utils";
import {MessagesEditParams, MessagesSendParams} from "vk-io/lib/api/schemas/params";
import { MessagesDeleteFullResponse, MessagesSendUserIdsResponse } from "vk-io/lib/api/schemas/responses";

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
		replyTo?: number,
		keyboard?: string
	): Promise<MessagesSendUserIdsResponse> {
		return new Promise((resolve, reject) => {
			const params: MessagesSendParams = {
				peer_id: context.peerId,
				random_id: 0,
				disable_mentions: disableMentions
			};

			if (message) params["message"] = message;
			if (replyTo) params["reply_to"] = replyTo;
			if (keyboard) params["keyboard"] = keyboard;

			vk.api.messages.send(params).then((id) => resolve(id)).catch(reject);
		});
	}

	static async editMessage(
		peerId: number,
		conversationMessageId: number,
		newText: string,
		disableMentions: boolean = true
	): Promise<boolean> {
		return new Promise(((resolve, reject) => {
			const params: MessagesEditParams = {
				peer_id: peerId,
				conversation_message_id: conversationMessageId,
				message: newText,
				disable_mentions: disableMentions
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

	static async replyMessage(context: MessageContext, message: string, keyboard?: string): Promise<MessagesSendUserIdsResponse> {
		return this.sendMessage(context, message, true, context.id, keyboard);
	}

	static async changeChatTitle(context: MessageContext, title: string): Promise<unknown> {
		return new Promise((resolve, reject) => {
			vk.api.messages.editChat({chat_id: context.chatId, title: title}).catch(reject).then(resolve);
		});
	}

	static async deleteMessage(peerId: number, conversationMessageId: number, deleteForAll: boolean = true): Promise<MessagesDeleteFullResponse> {
		return new Promise(async (resolve, reject) => {
			await vk.api.messages.delete({
				peer_id: peerId,
				conversation_message_ids: [conversationMessageId],
				delete_for_all: deleteForAll
			}).then(resolve).catch(reject);
		});
	}

}