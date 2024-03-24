/* eslint-disable @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

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