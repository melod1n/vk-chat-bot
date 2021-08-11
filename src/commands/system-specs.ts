import {Command} from '../model/chat-command';
import * as SystemInformation from 'systeminformation';
import {Api} from '../api/api';

export class SystemSpecs extends Command {
    regexp = /^\/systemspecs/i;
    title = '/systemSpecs';
    description = 'shows current pc\'s system specs';

    async execute(context) {
        let text = '';

        await Api.sendMessage(context, 'Retrieving data...').then(async () => {
            SystemInformation.osInfo().then(async (os) => {
                text += `OS: ${os.distro}\n`;
                SystemInformation.cpu().then(async (cpu) => {
                    text += `CPU: ${cpu.manufacturer} ${cpu.brand} ${cpu.physicalCores} cores ${cpu.cores} threads\n`;

                    SystemInformation.mem().then(async (memory) => {
                        const totalRam = memory.total / Math.pow(2, 30);
                        text += `RAM: ${totalRam} GB\n`;

                        await Api.sendMessage(context, text);
                    });
                });
            });
        })
    }
}