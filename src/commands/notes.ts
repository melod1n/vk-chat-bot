import {Command, Requirement, Requirements} from "../model/chat-command";
import {Note} from "../model/note";
import {CacheStorage} from "../database/cache-storage";
import {Api} from "../api/api";
import {ContextDefaultState, MessageContext} from "vk-io";

class NotesList extends Command {

    regexp = /^\/notes$/i;
    title = "/notes";
    description = "notes list";
    requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(context: MessageContext): Promise<void> {
        const notes = await CacheStorage.notes.get();

        if (notes.length == 0) {
            await Api.sendMessage(context, "Заметки отсутствуют");
            return;
        }

        let text = "Список заметок:\n";

        notes.forEach((note, index) => {
            text += `${index + 1}) ${note.title}\n${note.content}\n\n`;
        });

        await Api.sendMessage(context, text);
    }
}

class NoteAdd extends Command {

    regexp = /^\/note\s([^]+)\n/i;
    title = "/note [title]\n[content]";
    description = "Add note";
    requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(context: MessageContext<ContextDefaultState>, params: string[]): Promise<void> {
        const title = params[1].trim();
        const content = context.text.split("\n")[1];

        const note = new Note(title, content);

        CacheStorage.notes.storeSingle(note).then(async (r) => {
            if (r) {
                await Api.sendMessage(context, `Заметка "${title}" успешно сохранена.`);
            } else {
                await Api.sendMessage(context, `Заметка "${title}" уже существует.`);
            }
        }).catch(async () => {
            await Api.sendMessage(context, "Произошла ошибка при сохранении заметки.");
        });
    }
}

class NoteInfo extends Command {
    regexp = /^\/noteinfo\s([^]+)$/i;
    title = "/noteinfo [title]";
    description = "Shows note info";
    requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(context: MessageContext<ContextDefaultState>, params: string[]): Promise<void> {
        const param = params[1].trim();

        const titlesSplit = param.split(",");
        if (titlesSplit.length > 0) {
            const titles = titlesSplit.map(split => split.trim());
            const quotedTitles = titles.map(title => `"${title}"`);

            CacheStorage.notes.get(titles).then(async (notes) => {
                if (notes.length == 0) {
                    await Api.sendMessage(context, `Не найдено ни одной из заметок ${quotedTitles.join(", ")}.`);
                } else {
                    let text = "Информация о заметках:\n\n";

                    notes.forEach((note, index) => {
                        text += `${index + 1}) ${note.title}\n${note.content}\n\n`;
                    });

                    await Api.sendMessage(context, text);
                }
            }).catch(async () => {
                await Api.sendMessage(context, `Произошла ошибка при попытке получить информацию о заметках ${quotedTitles.join(", ")}.`);
            });
        } else {
            const title = param;

            CacheStorage.notes.getSingle(title).then(async (note) => {
                if (note) {
                    await Api.sendMessage(context, `${note.title}\n\n${note.content}`);
                } else {
                    await Api.sendMessage(context, `Заметка "${title}" не найдена.`);
                }
            }).catch(async () => {
                await Api.sendMessage(context, `Произошла ошибка при попытке получить информацию о заметке "${title}".`);
            });
        }
    }
}

class NoteDelete extends Command {
    regexp = /^\/delnote\s([^]+)/i;
    title = "/delnote [title]";
    description = "Delete note by it's title";
    requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(context: MessageContext, params: string[]): Promise<void> {
        const title = params[1].trim();

        CacheStorage.notes.deleteSingle(title).then(async (r) => {
            if (r) {
                await Api.sendMessage(context, `Заметка "${title}" успешно удалена.`);
            } else {
                await Api.sendMessage(context, "Заметка с таким названием не найдена.");
            }
        }).catch(async () => {
            await Api.sendMessage(context, "Произошла ошибка при удалении заметки.");
        });
    }
}

class NotesClear extends Command {
    regexp = /^\/clearnotes$/i;
    title = "/clearnotes";
    description = "Clear all notes";
    requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(context: MessageContext): Promise<void> {
        CacheStorage.notes.clear().then(async (count) => {
            await Api.sendMessage(context, `Заметок успешно удалено: ${count}.`);
        }).catch(async () => {
            await Api.sendMessage(context, "Произошла ошибка при удалении всех заметок.");
        });
    }
}

export {NotesList, NoteInfo, NoteAdd, NoteDelete, NotesClear};