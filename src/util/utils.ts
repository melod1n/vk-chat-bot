import * as child from 'child_process';
import {Command} from '../model/chat-command';

export class Utils {

    static async executeCommand(command: string): Promise<string> {
        return new Promise<any>(((resolve, reject) => {
            child.exec(command, (error, stdout, stderr) => {
                if (error) reject(error);
                else if (typeof stderr !== 'string') reject(stderr);
                else resolve(stdout);
            });
        }));
    }

    static getUptime(): string {
        const processSeconds = Math.ceil(process.uptime());

        let minutes = 0;
        let hours = 0;
        let days = 0;

        let i = 0;
        let seconds = 0;

        while (i < processSeconds) {
            i++;

            seconds++;

            if (seconds == 60) {
                minutes++;
                seconds = 0;
            }

            if (minutes == 60) {
                hours++;
                minutes = 0;
            }

            if (hours == 24) {
                days++;
                hours = 0;
            }
        }

        let text = '';

        if (days > 0) text += `${days} д. `;
        if (hours > 0) text += `${hours} ч. `;
        if (minutes > 0) text += `${minutes} м. `;
        if (seconds > 0) text += `${seconds} с. `;

        return text;
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