import { ConfigFile } from "./entities/ConfigFile";
import { FactoryWeb } from "./web/FactoryWeb";
import { Gallery } from "./entities/Gallery";
import { File } from "./entities/File";
import { System } from "./entities/System";
import { Tools } from "./Utils/Tools";
import { Log } from "./log/Log";
import { RegularExpresion } from "./Utils/Regex";
import { Uri } from "./entities/Uri";
import { Directory } from "./entities/Directory";
import { WebBasic } from "./web/WebBasic";
import { Messages } from "./log/messages/Messages";

class Main {
    
    private static config: ConfigFile;
    private static galleries: Gallery[];
    private static tempInstance: WebBasic | undefined;
    
    public static async start() {
        System.initilizeSessionId();
        this.defineExitBacklog();

        await this.readConfigurationFile();
        await this.readURIsFile();

        await this.cleanLogCache();
        
        for await (let gallery of this.galleries){
            this.tempInstance = FactoryWeb.getInstance(gallery);
            if(this.tempInstance)
                await this.tempInstance.downloadGallery();
        }

        await this.showFinalSummary();

        if(this.config.canUpdateURIsFile()){
            await this.updateURIsFile();
        }

        process.exit();
    }

    private static async defineExitBacklog(){
        process.on("exit", this.onExit);
        process.on('SIGINT', this.onExit);
        process.on('uncaughtException', this.onExit);
    }

    private static async onExit(){
        if(this.tempInstance){
            await this.tempInstance.forceDownload();
        }
        await this.cleanLogCache();
    }

    private static async readConfigurationFile() {
        this.config = await ConfigFile.getInstance();
    }

    private static async readURIsFile() {
        const file = await File.readSync(this.config.getFileURIsPath());
        const urisString = this.parseURIsFile(file);
        
        this.galleries = [];

        for(const uriString of urisString){
            this.galleries.push(new Gallery(uriString));
        }
    }

    private static parseURIsFile(fileString: string){
        let uris = fileString.split("\n");
        return uris.filter(uri => !Tools.isEmptyString(uri));
    }

    private static async showFinalSummary(){
        let gallerySuccessfullCount = 0;
        let galleryFailCount = 0;
        let downloadCount = 0;
        let errorCount = 0;
        
        let galleryMessages = "Galleries summary: \n\n";

        for (const gallery of this.galleries) {
            galleryMessages = galleryMessages + `${await gallery.getDownloadSummary()}\n`;
            
            if(gallery.isDownloadedSucessfull())
                gallerySuccessfullCount = gallerySuccessfullCount + 1;
            else
                galleryFailCount = galleryFailCount + 1;

            downloadCount = downloadCount + gallery.getGallerySize();
            errorCount = errorCount + gallery.getErrorCount();
        }

        let generalMessage = `General summary: \n`;
        generalMessage += ` -Galleries finished successfully: ${gallerySuccessfullCount}\n`;
        generalMessage += ` -Galleries finished with issues: ${galleryFailCount}\n`;
        generalMessage += ` -Total downloads: ${downloadCount}\n`;
        generalMessage += ` -Total errors: ${errorCount}\n`;

        await Log.logSync(Messages.LOGMESSA0002, [galleryMessages, generalMessage]);
    }

    private static async updateURIsFile(){
        let fileContent = "";

        for await (const gallery of this.galleries) {
            if(gallery.getState() != Gallery.STATE_DOWNLOADED)
                fileContent = `${fileContent}${gallery.getBaseUri()}\n`;
        }

        await File.writeSync(this.config.getFileURIsPath(), fileContent);
    }
    
    public static async cleanLogCache(): Promise<void>{
        const config = await ConfigFile.getInstance();
        const logCacheCount = config.getMaxGeneralLogCachedFiles();
        const regExpFileName = RegularExpresion.generalLogName();
        let files = await Directory.readDirSync(System.getLogDirectory());
        files = files.filter(file => file.match(regExpFileName));

        for (let index = 0; index < files.length - logCacheCount; index++) {
            const file = files[index];
            const path = Uri.join(System.getLogDirectory(), file);
            await File.removeSync(path);
            Log.log(Messages.LOGMESSA0001, path) 
        }
    }

}

(async () => { Main.start() })();