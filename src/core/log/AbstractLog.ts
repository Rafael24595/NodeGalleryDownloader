import { ConfigFile } from "../entities/ConfigFile";
import { File } from "../entities/File";
import { Message } from "../entities/Message";
import { Auxiliar } from "../type/Auxiliar";
import { Tools } from "../Utils/Tools";

export abstract class AbstractLog {

    private threadItems: string[];
    private threadState: boolean;

    protected constructor(){
        this.threadState = false;
        this.threadItems = [];
    }

    protected abstract getLogPath(): Promise<string>;
    protected abstract getLogDirectory(): Promise<string>;
    protected abstract createDirectories(): Promise<void>;

    protected abstract buildLogMessage(message: any): Promise<string>;

    public async logSync(message: string, aux?: Auxiliar): Promise<void>{
        const config = await ConfigFile.getInstance();
        const messageInstance = Message.buildMessage(message, aux);
        const fileContent = await this.buildLogMessage(messageInstance);
        
        if(config.canShowConsoleLog())
            console.log(fileContent);

        try {
            await this.writeSync(fileContent);
        } catch (error) {
            console.error(`[FILE-SAVE] Fatal error cannot print: ${fileContent}`);
        }
    }

    public async log(message: string, aux?: Auxiliar, swShowlog?: boolean): Promise<void>{
        const messageInstance = Message.buildMessage(message, aux);
        const fileContent = messageInstance.getCompleteMessage();

        if(swShowlog == undefined){
            const config = await ConfigFile.getInstance();
            swShowlog = config.canShowConsoleLog();
        }
        
        if(swShowlog)
            console.log(messageInstance.getCompleteMessage());

        try {
            this.writeThread(fileContent);
        } catch (error) {
            console.error(`[FILE-SAVE] Fatal error cannot print: ${messageInstance.getCompleteMessage()}`);
        }
    }

    protected async writeSync(content: string): Promise<void>{
        const logPath = await this.getLogPath();

        await this.createDirectories();

        await File.writeSync(logPath, content);
    }

    protected async writeThread(fileContent: string) {
        this.threadItems.push(fileContent);

        if(!this.threadState){
            this.threadState = true;

            let pileLength = this.threadItems.length;

            const logPath = await this.getLogPath();
            const file = File.open(logPath);

            for (let index = 0; index < pileLength; index++) {
                const element = this.threadItems[index];

                file.write(element + "\n");

                pileLength = this.threadItems.length;
            } 
            
            file.close();

            this.threadItems = [];
            this.threadState = false;
        }
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