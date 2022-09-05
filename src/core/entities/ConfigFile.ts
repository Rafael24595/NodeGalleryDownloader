import path from "path";
import { File } from "./File";
import { System } from "./System";
import { Tools } from "../Utils/Tools";
import { Exception } from "../exception/Exception";
import { Messages } from "../exception/messages/Messages";

export class ConfigFile {

    private static instance: ConfigFile;

    private conf_cache_general_log: number;
    private conf_show_console_log: boolean;

    private file_uris: string;
    private dire_download: string;
    private conf_pages_limit: number;
    private conf_download_limit: number;
    private conf_download_twice_gallery: boolean;
    private conf_download_twice_file: boolean;
    private conf_root_download: boolean;
    private conf_override_file: boolean;
    private conf_update_file_uris: boolean;
    private conf_show_gallery_log: boolean

    private constructor(){}

    public static async getInstance(){
        if(!this.instance){
            this.instance = new ConfigFile();
            await this.instance.establishConfiguration();
        }
        
        return this.instance;
    }

    public canShowConsoleLog(): boolean{
        return this.conf_show_console_log;
    }

    public getMaxGeneralLogCachedFiles(): number{
        return this.conf_cache_general_log;
    }

    public getFileURIsPath(): string{
        return this.file_uris;
    }

    public getDownloadDirectoryPath(): string{
        return this.dire_download;
    }

    public getReachedPagesLimit(): number{
        return this.conf_pages_limit;
    }

    public getDownloadLimit(): number{
        return this.conf_download_limit;
    }

    public canGalleryDownloadTwice(): boolean{
        return this.conf_download_twice_gallery;
    }

    public canImageDownloadTwice(): boolean{
        if(this.canImageOverride())
            return this.conf_download_twice_file;
        return true;
    }

    public canGalleryDownloadInRoot(): boolean{
        return this.conf_root_download;
    }

    public canImageOverride(): boolean{
        return this.conf_override_file;
    }

    public canUpdateURIsFile(): boolean{
        return this.conf_update_file_uris;
    }

    public canShowGalleryLog(): boolean{
        return this.conf_show_gallery_log;
    }

    private async establishConfiguration(): Promise<void>{
        await this.establishPrivateConfiguration()
        await this.establishUserConfiguration();
    }

    private async establishPrivateConfiguration(){
        const confPrivateFileName = System.getPrivateConfigurationFileName();
        const configString = await this.readConfigurationFile(confPrivateFileName);
        const config = this.parseConfigurationFile(configString);

        this.conf_cache_general_log = Tools.isNumber(config["conf_cache_general_log"]) ? config["conf_cache_general_log"] : 3;
        this.conf_show_console_log = Tools.isBoolean(config["conf_show_console_log"]) ? config["conf_show_console_log"] : true;
    }

    private async establishUserConfiguration(){
        const confUserFileName = System.getUserConfigurationFileName();
        const configString = await this.readConfigurationFile(confUserFileName);
        const config = this.parseConfigurationFile(configString);

        this.file_uris = Tools.isString(config["file_uris"]) ? config["file_uris"] : "";
        this.dire_download = Tools.isString(config["dire_download"]) ? config["dire_download"] : System.getDownloadDirectoryDefault();
        this.conf_pages_limit = Tools.isNumber(config["conf_pages_limit"]) ? config["conf_pages_limit"] : 0;
        this.conf_download_limit = Tools.isNumber(config["conf_download_limit"]) ? config["conf_download_limit"] : 0;
        this.conf_download_twice_gallery = Tools.isBoolean(config["conf_download_twice_gallery"]) ? config["conf_download_twice_gallery"] : false;
        this.conf_download_twice_file = Tools.isBoolean(config["conf_download_twice_file"]) ? config["conf_download_twice_file"] : true;
        this.conf_root_download = Tools.isBoolean(config["conf_root_download"]) ? config["conf_root_download"] : false;
        this.conf_override_file = Tools.isBoolean(config["conf_override_file"]) ? config["conf_override_file"] : true;
        this.conf_update_file_uris = Tools.isBoolean(config["conf_update_file_uris"]) ? config["conf_update_file_uris"] : false;
        this.conf_show_gallery_log = Tools.isBoolean(config["conf_show_gallery_log"]) ? config["conf_show_gallery_log"] : true;
    }

    private async readConfigurationFile(confFileName: string): Promise<string>{
        let config = "";
        try {
            const confDirectory = System.getConfigurationDirectory();
            const pathConfiguration = path.join(confDirectory, confFileName);

            config = await File.readSync(pathConfiguration);
        } catch (error) {
            throw new Exception(Messages.EXCEMESS0001);
        }

        return config;
    }

    private parseConfigurationFile(configString: string): any{
        try {
            return JSON.parse(configString);
        } catch (error) {
            return {};
        }
    }

}