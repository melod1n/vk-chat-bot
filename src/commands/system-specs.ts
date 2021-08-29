import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {hardwareInfo} from '../index';

export class SystemSpecs extends Command {
    regexp = /^\/systemspecs/i;
    title = '/systemSpecs';
    description = 'current hardware specs';

    async execute(context) {
        await Api.sendMessage(context,
            hardwareInfo.length === 0 ?
                'Данные отсутствуют. Попробуйте позже' : hardwareInfo);
    }
}