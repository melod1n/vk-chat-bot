import {Loader} from '../../model/loader';
import {VkUser} from '../../model/vk-user';
import {vk} from '../../index';
import {CacheStorage} from '../../database/cache-storage';
import {MemoryCache} from '../../database/memory-cache';

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

                users.forEach(user => MemoryCache.appendUser(user));

                await CacheStorage.users.store(users);
            });
        });
    }

    async loadSingle(userId: number): Promise<VkUser> {
        return new Promise((resolve, reject) => this.load([userId]).then(users => resolve(users[0])).catch(reject));
    }

}