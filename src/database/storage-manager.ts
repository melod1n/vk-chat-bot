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

class AllowedIds {
    ids: number[];
}

export class StorageManager {

    static answers = new Answers();
    static allowedIds: number[] = [];

    static fillAnswers(newAnswers: Answers) {
        this.answers.kickAnswers = newAnswers.kickAnswers;
        this.answers.inviteAnswers = newAnswers.inviteAnswers;
        this.answers.whoAnswers = newAnswers.whoAnswers;
        this.answers.betterAnswers = newAnswers.betterAnswers;
        this.answers.testAnswers = newAnswers.testAnswers;
    }

    static fillAllowedIds(allowedIds: number[]) {
        this.allowedIds = allowedIds;
    }
}

loadData().then();

function loadData(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const answers: Answers = JSON.parse(fs.readFileSync('data/answers.json').toString());
            const allowedIds: AllowedIds = JSON.parse(fs.readFileSync('data/allowed_ids.json').toString());

            StorageManager.fillAnswers(answers);
            StorageManager.fillAllowedIds(allowedIds.ids);

            resolve();
        } catch (e) {
            console.error(`${TAG_ERROR} storage-manager.ts: loadData(): ${Utils.getExceptionText(e)}`);
            reject(e);
        }
    });

}