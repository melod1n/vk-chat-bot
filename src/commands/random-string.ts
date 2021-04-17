import {Command} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';

export class RandomString extends Command {
    regexp = /^\/randomstring\s(\d+)/i;
    title = '/randomString [length]';
    name = '/randomString';
    description = 'returns randomized string (1 < length < 100)';

    async execute(context, params) {
        const l = parseInt(params[1]);

        const length = l > 100 && context.senderId != 362877006 ? 100 : l;

        let result = '';

        for (let i = 0; i < length; i++) {
            result += CHARACTERS.charAt(Utils.getRandomInt(CHARACTERS.length));
        }

        await Api.sendMessage(context, result);
    }


}