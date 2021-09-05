import {Loader} from '../../model/loader';
import {VkMessage} from '../../model/vk-message';
import {notImplemented} from '../base/errors';
import {vk} from '../../index';

export class MessagesLoader extends Loader<VkMessage> {

    async load(params: any): Promise<VkMessage[]> {
        throw notImplemented;
    }

    async loadSingle(params: any): Promise<VkMessage> {
        throw notImplemented;
    }

    async loadByConversationMessageId(peerId: number, conversationMessageId: number): Promise<VkMessage> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await vk.api.messages.getByConversationMessageId({
                    peer_id: peerId,
                    conversation_message_ids: conversationMessageId
                });

                const message = VkMessage.parse(response.items)[0];
                resolve(message);
            } catch (e) {
                reject(e);
            }
        });
    }

}