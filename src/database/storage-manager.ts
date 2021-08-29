import * as fs from 'fs';
import {TAG_ERROR} from '../index';
import {Utils} from '../util/utils';

class Answers {

    testAnswers: string[] = [];
    whoAnswers: string[] = [];
    betterAnswers: string[] = [];
    inviteAnswers: string[] = [];
    kickAnswers: string[] = [];

}

class Settings {

    messagesReceived: number = 0;
    messagesSent: number = 0;
    testAnswer: boolean = true;
    sendActionMessage: boolean = true;

}

export class StorageManager {

    static currentSentMessages: number = 0;
    static currentReceivedMessages: number = 0;

    static answers = new Answers();
    static settings = new Settings();

    static async increaseReceivedMessagesCount(): Promise<void> {
        this.currentReceivedMessages++;
        this.settings.messagesReceived++;
        return this.storeSettings();
    }

    static async increaseSentMessagesCount(): Promise<any> {
        this.currentSentMessages++;
        this.settings.messagesSent++;
        return this.storeSettings();
    }

    static async setTestAnswer(value: boolean): Promise<any> {
        this.settings.testAnswer = value;
        return this.storeSettings();
    }

    static async setSendActionMessage(value: boolean): Promise<any> {
        this.settings.sendActionMessage = value;
        return this.storeSettings();
    }

    static fillAnswers(newAnswers: Answers) {
        this.answers.kickAnswers = newAnswers.kickAnswers;
        this.answers.inviteAnswers = newAnswers.inviteAnswers;
        this.answers.whoAnswers = newAnswers.whoAnswers;
        this.answers.betterAnswers = newAnswers.betterAnswers;
        this.answers.testAnswers = newAnswers.testAnswers;
    }

    static fillSettings(newSettings: Settings) {
        this.settings.messagesReceived = newSettings.messagesReceived;
        this.settings.messagesSent = newSettings.messagesSent;
        this.settings.testAnswer = newSettings.testAnswer;
        this.settings.sendActionMessage = newSettings.sendActionMessage;
    }

    static async storeSettings(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFileSync('data/settings.json', JSON.stringify(this.settings, null, 2));
            } catch (e) {
                console.error(`${TAG_ERROR} storeSettings(): ${Utils.getExceptionText(e)}`);
                reject(e);
            }
        });
    }
}

loadData().then();

async function loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const answers: Answers = JSON.parse(fs.readFileSync('data/answers.json').toString());
            const settings: Settings = JSON.parse(fs.readFileSync('data/settings.json').toString());

            StorageManager.fillAnswers(answers);
            StorageManager.fillSettings(settings);

            resolve();
        } catch (e) {
            console.error(`${TAG_ERROR} storage-manager.ts: loadData(): ${Utils.getExceptionText(e)}`);
            reject(e);
        }
    });

}