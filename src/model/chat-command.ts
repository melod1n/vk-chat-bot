import {MessageContext, MessageForwardsCollection} from 'vk-io';

abstract class Command {

    abstract regexp: RegExp;
    abstract title: string;
    abstract description: string;
    requirements = new Requirements();

    abstract execute(
        context: MessageContext,
        params: string[],
        fwd?: MessageForwardsCollection,
        reply?: MessageContext
    ): Promise<void>;
}

class Requirements {
    requireBotCreator?: boolean = false;
    requireBotAdmin?: boolean = false;
    requireChatAdmin?: boolean = false;
    requireChat?: boolean = false;
    requireForwards?: boolean = false;
    requireReply?: boolean = false;

    static Build(): Requirements {
        return new Requirements();
    }

    isRequiresBotCreator(requireBotCreator: boolean): this {
        this.requireBotCreator = requireBotCreator;
        return this;
    }

    isRequiresBotAdmin(requireBotAdmin: boolean): this {
        this.requireBotAdmin = requireBotAdmin;
        return this;
    }

    isRequiresChatAdmin(requireChatAdmin: boolean): this {
        this.requireChatAdmin = requireChatAdmin;
        return this;
    }

    isRequiresChat(requireChat: boolean): this {
        this.requireChat = requireChat;
        return this;
    }

    isRequiresForwards(requireForward: boolean): this {
        this.requireForwards = requireForward;
        return this;
    }

    isRequiresReply(requireReply: boolean): this {
        this.requireReply = requireReply;
        return this;
    }

    apply(
        creatorOnly: boolean = false,
        requireAdmin: boolean = false,
        requireChatAdmin: boolean = false,
        requireChat: boolean = false,
        requireForwards: boolean = false,
        requireReply: boolean = false
    ): this {
        this.requireBotCreator = creatorOnly;
        this.requireBotAdmin = requireAdmin;
        this.requireChatAdmin = requireChatAdmin;
        this.requireChat = requireChat;
        this.requireForwards = requireForwards;
        this.requireReply = requireReply;
        return this;
    }
}

export {Command, Requirements};