import {Loader} from '../../model/loader';
import {VkUser} from '../../model/vk-user';
import {vk} from '../../index';
import {CacheStorage} from '../../database/cache-storage';

export class UsersLoader extends Loader<VkUser> {

    async load(usersIds: number[]): Promise<VkUser[]> {
        if (usersIds.length == 0) return null;

        return new Promise((resolve, reject) => {
            vk.api.users.get({
                user_ids: usersIds.join(','),
                fields: ['photo_50', 'photo_100', 'photo_200', 'status', 'screen_name', 'online', 'last_seen', 'verified', 'sex']
            }).catch(reject).then(async (r) => {
                const users = VkUser.parse(r);
                resolve(users);

                await CacheStorage.users.store(users);
            });
        });
    }

    async loadSingle(params: any): Promise<VkUser> {
        return Promise.resolve(undefined);
    }

}