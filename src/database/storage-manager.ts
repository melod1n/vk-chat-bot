import * as fs from "fs";
import {configPath, TAG_ERROR} from "../index";
import {Utils} from "../util/utils";
import {BotStats} from "../model/bot-stats";

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
    static stats: BotStats = new BotStats(0, 0);

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

    static fillStats(stats: BotStats) {
        this.stats = stats;
    }

    static loadData(): Promise<void> {
        return new Promise((resolve, reject) => {
            const answersFile = `${configPath}/answers.json`;
            const allowedIdsFile = `${configPath}/allowed_ids.json`;
            const statsFile = `${configPath}/stats.json`;

            try {
                if (!fs.existsSync(answersFile)) {
                    fs.writeFileSync(answersFile, `{"testAnswers":["шо"],"whoAnswers":[],"betterAnswers":[],"inviteAnswers":[],"kickAnswers":[]}`);
                }
                const answers: Answers = JSON.parse(
                    fs.readFileSync(answersFile).toString()
                );

                if (!fs.existsSync(allowedIdsFile)) {
                    fs.writeFileSync(allowedIdsFile, `{"ids":[]}`);
                }
                const allowedIds: AllowedIds = JSON.parse(fs.readFileSync(allowedIdsFile).toString());

                if (!fs.existsSync(statsFile)) {
                    fs.writeFileSync(statsFile, `{"receivedCount":0,"sentCount":0}`);
                }
                const stats: BotStats = JSON.parse(fs.readFileSync(statsFile).toString());

                StorageManager.fillAnswers(answers);
                StorageManager.fillAllowedIds(allowedIds.ids);
                StorageManager.fillStats(stats);

                resolve();
            } catch (e) {
                console.error(`${TAG_ERROR} storage-manager.ts: loadData(): ${Utils.getExceptionText(e)}`);
                reject(e);
            }
        });
    }

    static updateStats() {
        const statsFile = `${configPath}/stats.json`;

        fs.writeFileSync(statsFile, JSON.stringify(StorageManager.stats));
    }
}