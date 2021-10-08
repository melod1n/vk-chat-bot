import {Command, Requirements} from '../model/chat-command';
import {Note} from '../model/note';
import {CacheStorage} from '../database/cache-storage';
import {Api} from '../api/api';

class NoteAdd extends Command {

    regexp = /^\/note\s([^]+)\n/i;
    title = '/note';
    description = 'note';
    requirements = Requirements.Build().isRequiresBotAdmin(true);

    async execute(context, params): Promise<void> {
        const title = params[1];
        const content = context.text.split('\n')[1];

        const note = new Note(title, content);
        await CacheStorage.notes.storeSingle(note).then(async () => {
            await Api.sendMessage(context, 'Заметка успешно сохранена.');
        }).catch(async (e) => {
            await Api.sendMessage(context, 'Произошла ошибка при сохранении заметки. ');
        });

        // return new Promise(async (resolve, reject) => {
        //
        // });
    }
}


export {NoteAdd};