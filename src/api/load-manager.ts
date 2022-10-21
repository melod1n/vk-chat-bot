import {UsersLoader} from "./loader/users-loader";
import {ChatsLoader} from "./loader/chats-loader";
import {MessagesLoader} from "./loader/messages-loader";

export class LoadManager {

    static users = new UsersLoader();
    static chats = new ChatsLoader();
    static messages = new MessagesLoader();

}