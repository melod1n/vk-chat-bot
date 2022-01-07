import {Command, Requirement, Requirements} from '../model/chat-command';
import {Bat} from './bat';
import {vk} from '../index';

export class Restart extends Command {
    regexp = /^\/restart/i;
    title = '/restart';
    name = '/restart';
    description = 'restarts bot';

    requirements = Requirements.Create(Requirement.BOT_CREATOR);

    async execute(context): Promise<void> {
        await Promise.all([
            vk.updates.stop(),
            new Bat().execute(null, ['', 'npm start'])
        ]);
    }
}