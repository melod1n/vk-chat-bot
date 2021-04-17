import * as fs from 'fs';
import {Settings} from '../model/settings';
import {currentSentMessages} from '../index';

export let testAnswers: string[];
export let whoAnswers: string[];
export let betterAnswers: string[];
export let inviteAnswers: string[];
export let kickAnswers: string[];

export class SettingsStorage {
    static getStoredSettings(): Promise<Settings> {
        return new Promise((resolve, reject) => {
            try {
                // @ts-ignore
                const file = JSON.parse(fs.readFileSync('data/settings.json'));

                const settings = new Settings();
                settings.sendActionMessage = file.sendActionMessage;
                settings.testAnswer = file.testAnswer;
                settings.messagesReceived = file.messagesReceived;
                settings.messagesSent = file.messagesSent;

                resolve(settings);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    static storeSettings(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFileSync('data/settings.json', JSON.stringify(settings, null, 2));
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    static async increaseReceivedMessagesCount(): Promise<any> {
        settings.messagesReceived++;
        return this.storeSettings();
    }

    static async increaseSentMessagesCount(): Promise<any> {
        settings.messagesSent++;
        return this.storeSettings();
    }

    static async setTestAnswer(value: boolean): Promise<any> {
        settings.testAnswer = value;
        return this.storeSettings();
    }

    static async setSendActionMessage(value: boolean): Promise<any> {
        settings.sendActionMessage = value;
        return this.storeSettings();
    }
}

globalThis.settings = SettingsStorage;

export let settings: Settings;

SettingsStorage.getStoredSettings().then(r => {
    settings = r;

    globalThis.settingsData = settings;
});

loadAnswers();

function loadAnswers() {
    // @ts-ignore
    const file = JSON.parse(fs.readFileSync('data/answers.json'));

    testAnswers = file.test;
    whoAnswers = file.who;
    betterAnswers = file.better;
    inviteAnswers = file.invite;
    kickAnswers = file.kick;
}