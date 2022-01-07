import {Command, Requirement, Requirements} from '../model/chat-command';
import {Utils} from '../util/utils';

export class Reboot extends Command {
    regexp = /^\/reboot/i;
    title = '/reboot';
    description = 'reboots bot\'s os (if windows) in 5 seconds';

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

    async execute(context) {
        await context.sendAudioMessage('пк будет перезагружен через 5 секунд');

        await Utils.executeCommand('shutdown /r /c "reboot from vkbot" /t 5').catch(console.error);
    }

}