import {Command} from "../model/chat-command";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import {StorageManager} from "../database/storage-manager";

export class WhatBetter extends Command {
    regexp = /^\/(what|что)\s(better|лучше)\s([^]+)\s(or|или)\s([^]+)/i;
    title = "/what better [a] or [b]";
    name = "/what better";
    description = "a or b randomly (50% chance)";

    async execute(context, params) {
        const a = params[3];
        const b = params[5].trimStart();

        const better = Utils.getRandomInt(2) == 1 ? a : b;

        const text = `${StorageManager.answers.betterAnswers[Utils.getRandomInt(StorageManager.answers.betterAnswers.length)]} ${better}`;

        await Api.sendMessage(context, text, true);
    }

}