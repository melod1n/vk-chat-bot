import {Command, Requirement, Requirements} from "../model/chat-command";
import {Utils} from "../util/utils";

export class Shutdown extends Command {
    regexp = /^\/shutdown/i;
    title = "/shutdown";
    description = "shutdowns bot's os (if windows) in 5 seconds";

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

    async execute(context) {
        await context.send("пк будет выключен через 5 секунд");

        await Utils.executeCommand("shutdown /s /c \"shutdown from vkbot\" /t 5").catch(console.error);
    }

}