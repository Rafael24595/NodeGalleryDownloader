import { File } from "../entities/File";
import { Tools } from "../Utils/Tools";

export abstract class AbstractLog {

    protected abstract getLogPath(): Promise<string>;
    protected abstract getLogDirectory(): Promise<string>;
    protected abstract createDirectories(): Promise<void>;

    protected abstract buildLogMessage(message: any): Promise<string>;

    protected async writeLogSync(content: string): Promise<void>{
        const logPath = await this.getLogPath();

        await this.createDirectories();

        await File.writeSync(logPath, content);
    }

    protected async readLogSync(): Promise<string>{
        const logPath = await this.getLogPath();
        let content = "";
        if(await File.existsSync(logPath)){
            content = await File.readSync(logPath);
        }
        
        content = !Tools.isEmptyString(content) ? `${content}\n` : content;

        return content;
    }

}