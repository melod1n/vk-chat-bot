import {Command} from '../model/chat-command';
import {Api} from '../api/api';
import {vk} from '../index';
import {StorageManager} from '../database/storage-manager';

const dependencies = require('./../../package.json').dependencies;

export class About extends Command {
    regexp = /^\/about/i;
    title = '/about';
    description = 'information about this bot';

    async execute(context) {
        const depsKeys = Object.keys(dependencies);
        let depsValues = [];
        depsKeys.forEach(key => {
            depsValues.push(dependencies[key]);
        });

        let aboutText = `VK API v. ${vk.api.options.apiVersion}\n\n`;

        aboutText += 'Ответы: \n';
        aboutText += `* Тест: ${StorageManager.answers.testAnswers.length} ответов\n`;
        aboutText += `* Инвайт: ${StorageManager.answers.inviteAnswers.length} ответов\n`;
        aboutText += `* Кик: ${StorageManager.answers.kickAnswers.length} ответов\n`;
        aboutText += `* Кто: ${StorageManager.answers.whoAnswers.length} ответов\n`;
        aboutText += `* Что лучше: ${StorageManager.answers.betterAnswers.length} ответов\n`;

        aboutText += '\n';

        aboutText += 'Зависимости: \n';

        for (let i = 0; i < depsKeys.length; i++) {
            aboutText += `* ${depsKeys[i]} ${depsValues[i]}\n`;
        }

        aboutText += '\n\n@melod1n';


        const publicPromise =
            context.isChat ? Api.sendMessage(context, 'Отправил информацию в ЛС') : null;

        const privatePromise = vk.api.messages.send({
            random_id: 0,
            message: aboutText,
            peer_id: context.senderId,
            disable_mentions: true
        });

        await Promise.all([publicPromise, privatePromise]);
    }

}