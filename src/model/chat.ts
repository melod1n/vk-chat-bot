export class Chat {
    peerId: number = -1;
    type: string = '';
    localId: number = -1;
    title: string = '';
    isAllowed: boolean = true;
    membersCount: number = 0;
    admins: number[] = [];
    users: number[] = [];

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

    static parse(array): Chat[] {
        const chats: Chat[] = [];

        for (let i = 0; i < array.length; i++) {
            chats.push(new Chat(array[i]));
        }

        return chats;
    }

    getUsers(): string {
        return this.users.toString();
    }

    getAdminIds(): string {
        return this.admins.toString();
    }
}