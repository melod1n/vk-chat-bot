import {Command} from "../model/chat-command";
import {Api} from "../api/api";
import * as SystemInformation from "systeminformation";
import {ContextDefaultState, MessageContext} from "vk-io";
import {Environment} from "../common/environment";

let specsText: string = null;

export class SystemSpecs extends Command {
    regexp = /^\/systemspecs/i;
    title = "/systemSpecs";
    description = "current hardware specs";

    async execute(context: MessageContext<ContextDefaultState> & object) {
        if (specsText) {
            await Api.sendMessage(context, specsText);
            return;
        }

        const waitContext = await Api.sendMessage(context, "секунду...");

        const systemInfo = await Promise.all([
            SystemInformation.osInfo(),
            SystemInformation.cpu(),
            SystemInformation.mem()
        ]);

        const osInfo = systemInfo[0];
        const cpuInfo = systemInfo[1];
        const memoryInfo = systemInfo[2];

        const totalRam = Math.round(memoryInfo.total / Math.pow(2, 30));

        specsText = `NodeJS ${process.version}
                     OS: ${osInfo.distro}
                     Docker: ${Environment.IS_DOCKER}
                     CPU: ${cpuInfo.manufacturer} ${cpuInfo.brand} ${cpuInfo.physicalCores} (${cpuInfo.cores}) cores
                     RAM: ${totalRam} GB`;

        await Api.editMessage(waitContext, specsText);
    }
}