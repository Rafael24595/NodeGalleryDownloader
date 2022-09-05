import { ConfigFile } from "../entities/ConfigFile";
import { Directory } from "../entities/Directory";
import { Message } from "../entities/Message";
import { System } from "../entities/System";
import { Auxiliar } from "../type/Auxiliar";
import { Transform } from "../Utils/Transform";
import { AbstractLog } from "./AbstractLog";

export class Log extends AbstractLog{

    private constructor(){
        super();
    }

    public static async log(message: string, aux?: Auxiliar): Promise<Log>{
        const config = await ConfigFile.getInstance();
        const instance = new Log();
        const messageInstance = Message.buildMessage(message, aux);
        const fileContent = await instance.buildLogMessage(messageInstance);

        if(config.canShowConsoleLog())
            console.log(fileContent);

        try {
            await instance.writeLogSync(fileContent);
        } catch (error) {
            console.error(`[FILE-SAVE] Fatal error cannot print: ${messageInstance.getCompleteMessage()}`);
        }

        return instance;
    }

    protected async getLogPath(): Promise<string>{
        const date = System.getSessionId();
        const dateString = Transform.integerToDayMonthYear(date, '-');
        const timeString = Transform.integerToHourMinutesSeconds(date, '-');

        return `${System.getLogDirectory()}/Log-[${dateString}_${timeString}].txt`;
    }

    protected async getLogDirectory(): Promise<string> {
        return System.getLogDirectory();
    }

    protected async createDirectories(): Promise<void> {
        await this.createLogDirectory();
    }

    protected async buildLogMessage(messageInstance: Message): Promise<string>{
        const date = Date.now();
        let fileContent = await this.readLogSync();

        const dateString = Transform.integerToDayMonthYear(date);
        const timeString = Transform.integerToHourMinutesSeconds(date);

        return `${fileContent}${dateString} - ${timeString} => ${messageInstance.getCompleteMessage()}`;
    }

    private async createLogDirectory(): Promise<void>{
        const logDirectory = await this.getLogDirectory();
        await Directory.createDirSync(logDirectory);
    }
}