import {Command, Requirement, Requirements} from "../model/chat-command";

export class Shutdown extends Command {
    regexp = /^\/shutdown/i;
    title = "/shutdown";
    description = "shutdowns bot's os (if windows) in 5 seconds";

    requirements = Requirements.Build(Requirement.BOT_CREATOR);

    async execute() {
    }
}