import {Command, Requirement, Requirements} from '../model/chat-command';
import {TAG_ERROR} from '../index';
import {Utils} from '../util/utils';
import * as fetch from 'node-fetch';
import {Api} from '../api/api';

export class JsonRequest extends Command {
    regexp = /^\/json\s([^]+)/i;
    title = '/json';
    description = 'retrieved json from url';

    requirements = Requirements.Create(Requirement.BOT_ADMIN);

    async execute(context, params) {
        let url = params[1];
        if (!url.includes('http') && !url.includes('///')) url = `https://${url}`;

        const waitContext = await context.send('секунду...');

        try {
            const f = (await fetch(url));
            const js = await f.json();
            const result = (JSON.stringify(js, null, 2));

            await Api.editMessage(context.peerId, waitContext.conversationMessageId, result);
        } catch (e) {
            console.error(`${TAG_ERROR} json-request.ts: ${Utils.getExceptionText(e)}`);

            await Api.editMessage(context.peerId, waitContext.conversationMessageId, 'Произошла ошибка 😞');
        }
    }
}