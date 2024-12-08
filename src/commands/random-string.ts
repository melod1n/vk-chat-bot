import {Command} from "../model/chat-command";
import {Utils} from "../util/utils";
import {Api} from "../api/api";
import {Environment} from "../common/environment";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789";

export class RandomString extends Command {
    regexp = /^\/randomstring\s(\d+)/i;
    title = "/randomString [length]";
    name = "/randomString";
    description = "randomized string (1 < length < 100)";

    async execute(context, params) {
        const l = parseInt(params[1]);

        const length = l > 100 && context.senderId != Environment.CREATOR_ID ? 100 : l;

        let result = `Randomized string [${length}]: `;

        for (let i = 0; i < length; i++) {
            result += CHARACTERS.charAt(Utils.getRandomInt(CHARACTERS.length));
        }

        await Api.sendMessage(context, result);
    }
}