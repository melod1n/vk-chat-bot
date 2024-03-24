import {Command, Requirement, Requirements} from "../model/chat-command";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import { MessageContext, ContextDefaultState } from "vk-io";

export class Cmd extends Command {
    regexp = /^\/cmd\s([^]+)/i;
    title = "/cmd [value]";
    name = "/cmd";
    description = "executed value in cmd";

    requirements = Requirements.Build(Requirement.BOT_CREATOR);

    async execute(context: MessageContext<ContextDefaultState>, params: any[]) {
        const text = params[1];

        const result = await Utils.executeCommand(text);
        await Api.sendMessage(context, result);
    }
}