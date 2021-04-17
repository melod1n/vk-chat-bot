export class User {
    userId: number;
    firstName: string;
    lastName: string;
    isClosed: boolean;
    photo200: string;

    constructor(json = null) {
        if (json) {
            this.userId = json.id;
            this.firstName = json.first_name;
            this.lastName = json.last_name;
            this.isClosed = json.is_closed;

            this.photo200 = json.photo_200;
        }
    }

    static parse(array): User[] {
        const users: User[] = [];

        for (let i = 0; i < array.length; i++) {
            users.push(new User(array[i]));
        }

        return users;
    }
}