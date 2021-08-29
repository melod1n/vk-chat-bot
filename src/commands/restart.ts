import {Command, Requirements} from '../model/chat-command';
import {Bat} from './bat';
import {vk} from '../index';

export class Restart extends Command {
    regexp = /^\/restart/i;
    title = '/restart';
    name = '/restart';
    description = 'restarts bot';

    requirements = Requirements.builder().apply(true);

    async execute(context): Promise<void> {
        await Promise.all([
            vk.updates.stop(),
            new Bat().execute(null, ['', 'npm start'])
        ]);
    }
}