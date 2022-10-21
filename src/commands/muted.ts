import {Command} from "../model/chat-command";

class MuteAdd extends Command {
    regexp = /^\/addmuted\s([^]+)/i;
    title = "/addMuted";
    description = "потом добавлю описание";

    execute(context, params): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

}