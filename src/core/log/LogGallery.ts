import { Gallery } from "../entities/Gallery";
import { Message } from "../entities/Message";
import { AbstractLog } from "./AbstractLog";

export class GalleryLog extends AbstractLog {
    
    private gallery: Gallery;

    private constructor(gallery: Gallery){
        super();
        this.gallery = gallery;
    }

    public static getInstance(gallery: Gallery): GalleryLog{
        return new GalleryLog(gallery);;
    }

    protected async getLogPath(): Promise<string> {
        let galleryDir = await this.getLogDirectory();
        let galleryName = await this.gallery.getGalleryName();
        return `${galleryDir}${galleryName}.txt`;
    }
    protected async getLogDirectory(): Promise<string> {
        return await this.gallery.getGalleryDir();
    }

    protected async createDirectories(): Promise<void> {
        await this.gallery.createDirectories();
    }

    protected async buildLogMessage(messageInstance: Message): Promise<string>{
        let fileContent = await this.readLogSync();
        return `${fileContent}${messageInstance.getCompleteMessage()}`;
    }

}