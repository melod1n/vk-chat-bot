import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import * as SystemInformation from 'systeminformation';

export class SystemSpecs extends Command {
    regexp = /^\/systemspecs/i;
    title = '/systemSpecs';
    description = 'current hardware specs';

    async execute(context) {
        await Api.sendMessage(context, 'секунду...');

        const systemInfo = await Promise.all([
            SystemInformation.osInfo(),
            SystemInformation.cpu(),
            SystemInformation.mem()
        ]);

        const osInfo = systemInfo[0];
        const cpuInfo = systemInfo[1];
        const memoryInfo = systemInfo[2];

        const totalRam = memoryInfo.total / Math.pow(2, 30);

        const text = `NodeJS ${process.version}
                  OS: ${osInfo.distro}
                  CPU: ${cpuInfo.manufacturer} ${cpuInfo.brand} ${cpuInfo.physicalCores} (${cpuInfo.cores}) cores
                  RAM: ${totalRam} GB`;

        await Api.sendMessage(context, text);
    }
}