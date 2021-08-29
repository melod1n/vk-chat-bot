import {Command, Requirements} from '../model/chat-command';
import {TAG, TAG_ERROR} from '../index';
import {Utils} from '../util/utils';
import * as fetch from 'node-fetch';
import {Api} from '../api/api';

export class JsonRequest extends Command {
    regexp = /^\/json\s([^]+)/i;
    title = '/json';
    description = 'retrieved json from url';

    requirements = Requirements.builder().apply(false, true, false, false, false, false);

    async execute(context, params) {
        let url = params[1];
        if (!url.includes('http') && !url.includes('///')) url = `https://${url}`;

        await Api.sendMessage(context, 'секунду...');

        try {
            const result = JSON.stringify((await fetch(url)).json());
            await Api.sendMessage(context, result, null, context.id);
        } catch (e) {
            console.error(`${TAG_ERROR} /json: ${Utils.getExceptionText(e)}`);
            await Api.sendMessage(context, 'Произошла ошибка.', null, context.id);
        }
    }
}