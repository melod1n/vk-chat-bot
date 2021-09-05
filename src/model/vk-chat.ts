import {VkUser} from './vk-user';

export class VkChat {
    peerId: number = -1;
    type: string = '';
    localId: number = -1;
    title: string = '';
    isAllowed: boolean = true;
    membersCount: number = 0;
    admins: number[] = [];
    usersIds: number[] = [];
    users: VkUser[] = [];

    constructor(json = null) {
        if (json) {
            const peer = json.peer;
            if (peer) {
                this.peerId = peer.id;
                this.type = peer.type;
                this.localId = peer.local_id;
            }

            const settings = json.chat_settings;
            if (settings) {
                this.title = settings.title;
                this.membersCount = settings.members_count;
                this.admins = settings.admin_ids;
            }

            const canWrite = json.can_write;
            if (canWrite) {
                this.isAllowed = canWrite.allowed;
            }
        }
    }

    static parse(array): VkChat[] {
        const chats: VkChat[] = [];

        for (let i = 0; i < array.length; i++) {
            chats.push(new VkChat(array[i]));
        }

        return chats;
    }

    getUsers(): string {
        return this.usersIds.toString();
    }

    getAdminIds(): string {
        return this.admins.toString();
    }
}