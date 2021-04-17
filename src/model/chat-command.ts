import {MessageContext, MessageForwardsCollection} from 'vk-io';

export class Command {
    regexp: RegExp;
    title: string;
    name?: string;
    description: string;
    requirements = new Requirements();

    async execute(context: MessageContext, params: string[], fwd?: MessageForwardsCollection, reply?: MessageContext) {
    }
}

export class Requirements {
    creatorOnly?: boolean = false;
    requireAdmin?: boolean = false;
    requireChatAdmin?: boolean = false;
    requireChat?: boolean = false;
    requireForwards?: boolean = false;
    requireReply?: boolean = false;

    static builder(): Requirements {
        return new Requirements();
    }

    apply(creatorOnly: boolean = false, requireAdmin: boolean = false, requireChatAdmin: boolean = false, requireChat: boolean = false, requireForwards: boolean = false, requireReply: boolean = false): this {
        this.creatorOnly = creatorOnly;
        this.requireAdmin = requireAdmin;
        this.requireChatAdmin = requireChatAdmin;
        this.requireChat = requireChat;
        this.requireForwards = requireForwards;
        this.requireReply = requireReply;
        return this;
    }
}