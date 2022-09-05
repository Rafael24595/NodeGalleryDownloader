import fs from "fs";
import { ConfigFile } from "./ConfigFile";
import { Tools } from "../Utils/Tools";

export class System {

    public static readonly defaultWebUser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36";

    private static readonly dirDownloadsDefault = "./downloads";
    private static readonly dirConfiguration = "./config";
    private static readonly dirLog = "./log"
    private static readonly fileUserConfiguration = "user_config.json";
    private static readonly filePrivateConfiguration = "private_config.json";

    private static sessionId = 0;

    public static getDownloadDirectoryDefault(): string{
        return this.dirDownloadsDefault;
    }

    public static async getDownloadDirectory(): Promise<string>{
        let configuration = await ConfigFile.getInstance();
        let dirDownloads = configuration.getDownloadDirectoryPath();
        if(Tools.isEmptyString(dirDownloads))
            return this.dirDownloadsDefault
        return dirDownloads;
    }

    public static getConfigurationDirectory(): string{
        return this.dirConfiguration;
    }

    public static getLogDirectory(): string{
        return this.dirLog;
    }

    public static getUserConfigurationFileName(): string{
        return this.fileUserConfiguration;
    }

    public static getPrivateConfigurationFileName(): string{
        return this.filePrivateConfiguration;
    }

    public static getSessionId(): number{
        this.initilizeSessionId();
        return this.sessionId;
    }

    public static initilizeSessionId(): boolean{
        let swInitilized = this.sessionId != 0;
        if(!swInitilized)
            this.sessionId = Date.now();
        return swInitilized;
    }

    public static async existsSync(dir: string): Promise<boolean>{
        return fs.existsSync(dir)     
    }

}