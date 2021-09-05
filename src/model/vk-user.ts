export class VkUser {
    id: number;
    firstName: string;
    lastName: string;
    isClosed: boolean;
    photo200: string;

    online: boolean;
    onlineMobile: boolean;
    lastSeen: number;
    onlineVisible: boolean;
    onlineApp: number;

    sex: number;

    constructor(json = null) {
        if (json) {
            this.id = json.id;
            this.firstName = json.first_name;
            this.lastName = json.last_name;
            this.isClosed = json.is_closed;

            this.photo200 = json.photo_200;

            this.sex = json.sex;
            this.online = json.online == 1;

            if (json.online_info) {
                this.onlineMobile = json.online_info.is_mobile || false;
                this.lastSeen = json.online_info.last_seen || -1;
                this.onlineVisible = json.online_info.visible || false;
                this.onlineApp = json.online_info.app_id || -1;
            } else {
                this.onlineMobile = false;
                this.lastSeen = -1;
                this.onlineVisible = false;
            }
        }
    }

    static parse(array): VkUser[] {
        const users: VkUser[] = [];

        for (let i = 0; i < array.length; i++) {
            users.push(new VkUser(array[i]));
        }

        return users;
    }
}