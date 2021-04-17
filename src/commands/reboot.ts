import {Command, Requirements} from '../model/chat-command';
import {Utils} from '../util/utils';
import {Api} from '../api/api';

export class Reboot extends Command {
    regexp = /^\/reboot/i;
    title = '/reboot';
    description = 'reboots root pc in 5 seconds';

    requirements = Requirements.builder().apply(true);

    async execute(context) {
        await Api.sendMessage(context, 'пк будет перезагружен через 5 секунд');

        Utils.executeCommand('shutdown /r /c "reboot from vkbot" /t 5').catch(console.error);
    }

}