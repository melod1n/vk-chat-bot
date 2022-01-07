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

export class StorageManager {

    static currentSentMessages: number = 0;
    static currentReceivedMessages: number = 0;

    static answers = new Answers();

    static fillAnswers(newAnswers: Answers) {
        this.answers.kickAnswers = newAnswers.kickAnswers;
        this.answers.inviteAnswers = newAnswers.inviteAnswers;
        this.answers.whoAnswers = newAnswers.whoAnswers;
        this.answers.betterAnswers = newAnswers.betterAnswers;
        this.answers.testAnswers = newAnswers.testAnswers;
    }
}

loadData().then();

async function loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const answers: Answers = JSON.parse(fs.readFileSync('data/answers.json').toString());

            StorageManager.fillAnswers(answers);

            resolve();
        } catch (e) {
            console.error(`${TAG_ERROR} storage-manager.ts: loadData(): ${Utils.getExceptionText(e)}`);
            reject(e);
        }
    });

}