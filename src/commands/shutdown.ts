import {Command, Requirements} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Shutdown extends Command {
    regexp = /^\/shutdown/i;
    title = '/shutdown';
    description = 'shutdowns bot\'s os (if windows) in 5 seconds';

    requirements = Requirements.builder().apply(true);

    async execute(context) {
        await Api.sendMessage(context, 'пк будет выключен через 5 секунд');

        await Utils.executeCommand('shutdown /s /c "shutdown from vkbot" /t 5').catch(console.error);
    }

}