import {Command} from '../model/chat-command';
import {settings, testAnswers} from '../database/settings-storage';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Test extends Command {
    regexp = /^(test|тест|еуые|ntcn|инноке(нтий|ш|нтич))/i;
    title = 'test';
    description = 'жив ли бот';

    async execute(context) {
        if (!settings.testAnswer) return;

        const index = Utils.getRandomInt(testAnswers.length);
        await Api.sendMessage(context, testAnswers[index]);
    }
}