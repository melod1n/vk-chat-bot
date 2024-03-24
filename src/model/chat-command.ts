import {MessageContext, MessageForwardsCollection} from "vk-io";

abstract class Command {

    abstract regexp: RegExp;
    abstract title: string;
    abstract description: string;
    requirements = Requirements.Build();

    abstract execute(
        context: MessageContext,
        params: string[],
        fwd?: MessageForwardsCollection,
        reply?: MessageContext
    ): Promise<void>;

    toString(): string {
        return `${this.title}: ${this.description}`;
    }
}

export enum Requirement {
    BOT_CREATOR,
    BOT_ADMIN,
    BOT_CHAT_ADMIN,
    CHAT,
    FORWARDS,
    REPLY
}

class Requirements {
    requirements: Requirement[] = [];

    private constructor(requirements?: Requirement[]) {
        this.requirements = requirements;
    }

    static Build(...requirements: Requirement[]): Requirements {
        return new Requirements(requirements);
    }

    isRequiresBotCreator(): boolean {
        return this.requirements.includes(Requirement.BOT_CREATOR);
    }

    isRequiresBotAdmin(): boolean {
        return this.requirements.includes(Requirement.BOT_ADMIN);
    }

    isRequiresBotChatAdmin(): boolean {
        return this.requirements.includes(Requirement.BOT_CHAT_ADMIN);
    }

    isRequiresChat(): boolean {
        return this.requirements.includes(Requirement.CHAT);
    }

    isRequiresForwards(): boolean {
        return this.requirements.includes(Requirement.FORWARDS);
    }

    isRequiresReply(): boolean {
        return this.requirements.includes(Requirement.REPLY);
    }
}

export {Command, Requirements};