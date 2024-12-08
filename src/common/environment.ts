export class Environment {
    static IS_DEBUG: boolean;
    static TOKEN: string;
    static IS_DOCKER: boolean;

    static CREATOR_ID: number;
    static MAIN_CHAT_ID: number;
    static PREDEFINED_API_VERSION: string;
    static LOG_NEW_MESSAGES: boolean;
    static KICK_UNALLOWED_MEMBERS: boolean;

    static load() {
        Environment.IS_DEBUG = process.env.DEBUG == "true";
        Environment.TOKEN = process.env["TOKEN"];
        Environment.IS_DOCKER = process.env.IS_DOCKER == "true";

        Environment.CREATOR_ID = Number(process.env["CREATOR_ID"]);
        Environment.MAIN_CHAT_ID = Number(process.env["MAIN_CHAT_ID"]);
        Environment.PREDEFINED_API_VERSION = process.env.API_VERSION;
        Environment.LOG_NEW_MESSAGES = process.env.LOG_NEW_MESSAGES == "true";
        Environment.KICK_UNALLOWED_MEMBERS = process.env.KICK_UNALLOWED_MEMBERS == "true";
    }
}