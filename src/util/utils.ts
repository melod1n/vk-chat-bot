import * as child from 'child_process';
import {Command} from '../model/chat-command';

export class Utils {
    static executeCommand(command: string): Promise<any> {
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

    static removeFromArray(arr: any[], value: any): any[] {
        return arr.filter(function (ele: any) {
            return ele != value;
        });
    }

    static deepEqual(object1: { [x: string]: any },
                     object2: { [x: string]: any; year?: number; month?: number; day?: number }
    ): boolean {
        if ((object1 == null || object2 == null) && object1 != object2) return false;

        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            const val1 = object1[key];
            const val2 = object2[key];
            const areObjects = Utils.isObject(val1) && Utils.isObject(val2);
            if (areObjects && !Utils.deepEqual(val1, val2) || !areObjects && val1 !== val2) {
                return false;
            }
        }

        return true;
    }

    static isObject(object: any): boolean {
        return object != null && typeof object === 'object';
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

    // static getStoredAnswers(): Promise<>{
    //     try {
    //         // @ts-ignore
    //         const json = JSON.parse(fs.readFileSync('answers.json'));
    //
    //         testAnswers = json.test;
    //         betterAnswers = json.better;
    //         whoAnswers = json.who;
    //         kickAnswers = json.kick;
    //         inviteAnswers = json.invite;
    //         dayPidorAnswers = json.dayPidor;
    //
    //         return 'success';
    //     } catch (e) {
    //         console.error(e);
    //         return e.toString();
    //     }
    // }
}