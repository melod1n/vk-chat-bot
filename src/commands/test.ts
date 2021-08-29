import {Command} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';
import {StorageManager} from '../database/storage-manager';

export class Test extends Command {
    regexp = /^(test|тест|еуые|ntcn|инноке(нтий|ш|нтич))/i;
    title = 'test';
    description = 'жив ли бот';

    async execute(context) {
        if (!StorageManager.settings.testAnswer) return;

        const index = Utils.getRandomInt(StorageManager.answers.testAnswers.length);
        await Api.sendMessage(context, StorageManager.answers.testAnswers[index]);
    }
}