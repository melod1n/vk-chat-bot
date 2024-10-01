import * as child from "child_process";
import { Command } from "../model/chat-command";
import os from "os";

export class Utils {

    static async executeCommand(command: string): Promise<string> {
        return new Promise<string>(((resolve, reject) => {
            child.exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                else if (typeof stderr !== "string") reject(stderr);
                else resolve(stdout);
            });
        }));
    }

    static getUptime(): string {
        const processUptime = Math.ceil(process.uptime());

        const processDays = Math.floor(processUptime / (3600 * 24));
        const processHours = Math.floor(processUptime / 3600);
        const processMinutes = Math.floor((processUptime % 3600) / 60);
        const processSeconds = Math.floor(processUptime % 60);

        const processUptimeText = `${processDays > 0 ? `${processDays} д. ` : ""}` +
            `${processHours > 0 ? `${processHours} ч. ` : ""}` +
            `${processMinutes > 0 ? `${processMinutes} м. ` : ""}` +
            `${processSeconds > 0 ? `${processSeconds} с.` : ""}`;

        const osUptime = Math.ceil(os.uptime());

        const osDays = Math.floor(osUptime / (3600 * 24));
        const osHours = Math.floor(osUptime / 3600);
        const osMinutes = Math.floor((osUptime % 3600) / 60);
        const osSeconds = Math.floor(osUptime % 60);

        const osUptimeText = `${osDays > 0 ? `${osDays} д. ` : ""}` +
            `${osHours > 0 ? `${osHours} ч. ` : ""}` +
            `${osMinutes > 0 ? `${osMinutes} м. ` : ""}` +
            `${osSeconds > 0 ? `${osSeconds} с.` : ""}`;

        return `Docker контейнер:\n${processUptimeText}\n\nСистема:\n${osUptimeText}`;
    }

    static getRandomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    static getRangedRandomInt(from: number, to: number): number {
        return Utils.getRandomInt(to - from) + from;
    }

    static getExceptionText(e: Error): string {
        return `Exception caught
                * Error : ${e.name}
                * Message : ${e.message}
                * StackTrace : 
                    ${e.stack}`;
    }

    static compareCommands(command1: Command, command2: Command): number {
        return command1.title < command2.title ? -1 : command1.title > command2.title ? 1 : 0;
    }
}

export function requireNotNull<T>(object?: T, message?: string): T {
    if (!object) {
        throw Error(message ? message : "Required value is null");
    } else {
        return object;
    }
}