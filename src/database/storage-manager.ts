import * as fs from "fs";
import { TAG_ERROR, configPath } from "../index";
import { Utils } from "../util/utils";

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

    static loadData(): Promise<void> {
        return new Promise((resolve, reject) => {
            const answersFile = `${configPath}/answers.json`;
            const allowedIdsFile = `${configPath}/allowed_ids.json`;
            try {
                if (!fs.existsSync(answersFile)) {
                    fs.writeFileSync(answersFile, `{"testAnswers":[],"whoAnswers":[],"betterAnswers":[],"inviteAnswers":[],"kickAnswers":[]}`);
                }
                const answers: Answers = JSON.parse(
                    fs.readFileSync(answersFile).toString()
                );

                if (!fs.existsSync(allowedIdsFile)) {
                    fs.writeFileSync(allowedIdsFile, `{"ids":[]}`);
                }

                const allowedIds: AllowedIds = JSON.parse(fs.readFileSync(allowedIdsFile).toString());

                StorageManager.fillAnswers(answers);
                StorageManager.fillAllowedIds(allowedIds.ids);

                resolve();
            } catch (e) {
                console.error(`${TAG_ERROR} storage-manager.ts: loadData(): ${Utils.getExceptionText(e)}`);
                reject(e);
            }
        });
    }
}