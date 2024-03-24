import {Command, Requirement, Requirements} from "../model/chat-command";

export class Reboot extends Command {
    regexp = /^\/reboot/i;
    title = "/reboot";
    description = "reboots bot's os (if windows) in 5 seconds";

    requirements = Requirements.Build(Requirement.BOT_CREATOR);

    async execute() {
    }
}