import { Exception } from "../exception/Exception";
import { Log } from "../log/Log";
import { GalleryLog } from "../log/LogGallery";
import { Directory } from "./Directory";
import { System } from "./System";
import { Tools } from "../Utils/Tools";
import { Transform } from "../Utils/Transform";
import { Uri } from "./Uri";
import { ConfigFile } from "./ConfigFile";
import { Error } from "./Error";
import { Auxiliar } from "../type/Auxiliar";
import { Messages } from "../exception/messages/Messages";

export class Gallery {

    public static readonly STATE_PENDING = "PENDING";
    public static readonly STATE_WORK_IN_PROGRESS = "WORK_IN_PROGRESS";
    public static readonly STATE_DOWNLOADED = "DOWNLOADED";
    public static readonly STATE_DOWNLOADED_IRREGULAR = "DOWNLOADED_IRREGULAR";
    public static readonly STATE_ERROR = "ERROR";

    private uriBase: string;
    private uriImages: string[];
    private logGallery: GalleryLog;

    protected gallerySize: number;
    protected galleryPagesSize: number;
    protected galleryPagePointer: number;
    protected errors: Error[];

    private state: string;

    constructor(uriBase:string){
        this.uriBase = uriBase;
        this.logGallery = GalleryLog.getInstance(this);

        this.resetGallery();
    }

    private resetGallery(): void{
        this.uriImages = [];
        this.gallerySize = 0
        this.galleryPagesSize = 0;
        this.galleryPagePointer = 0;
        this.errors = [];

        this.StatePending();
    }

    public getBaseUri(): string{
        return this.uriBase;
    }

    public getImageURIs(): string[]{
        return this.uriImages;
    }

    public getStorageLength(): number{
        return this.uriImages.length;
    }

    public getHostName(): string{
        return Uri.hostName(this.uriBase);
    }

    public getGallerySize(): number{
        return this.gallerySize;
    }
    
    public getGalleryPagesSize(): number{
        return this.galleryPagesSize;
    }
    
    public getGalleryPagePointer(): number{
        return this.galleryPagePointer;
    }
    
    public getErrorCount(): number{
        return this.errors.length;
    }

    public getState(){
        return this.state;
    }

    public async getGalleryName(): Promise<string>{
        let galleryName = Uri.cleanBasename(this.uriBase);
        if(Tools.isEmptyString(galleryName)){
            galleryName = await this.getGenericGalleryName();
        }
        return galleryName;
    }

    public async getGalleryDir(){
        const config = await ConfigFile.getInstance();
        let galleryDir = "";

        if(!config.canGalleryDownloadInRoot()){
            const galleryName = await this.getGalleryName();
            const hostName = this.getHostName();

            galleryDir = `${hostName}_${galleryName}/`;
        }

        return `${await System.getDownloadDirectory()}/${galleryDir}`;
    }

    private async getGenericGalleryName(): Promise<string>{
        let swDirExists = true;
        let index = 1;
        let genericName = "";
    
        while (swDirExists && index < 999) {
          let hostName = this.getHostName();
          let formatNumber = Transform.formatNumber(3, index);
          let name = `Generic-${hostName}-${formatNumber}`;
    
          swDirExists = await System.existsSync(`${await System.getDownloadDirectory()}/${name}/`);
    
          if(!swDirExists)
            genericName = name;
        }
    
        if(Tools.isEmptyString(genericName))
          throw new Exception(Messages.EXCEMESS0002);
    
        return genericName;
    }

    public setGalleryPagesSize(galleryPagesSize: number): void{
        this.galleryPagesSize = galleryPagesSize;
    }

    public setImageURIs(uriImages: string[]): void{
        this.uriImages = uriImages;
    }

    public pushImageURIs(uris: string | string[]): void{
        const newUris = Array.isArray(uris) ? uris : [uris];
        this.uriImages = this.uriImages.concat(newUris);
    }

    public async log(message: string, aux?: Auxiliar): Promise<void>{
        const config = await ConfigFile.getInstance()
        if(config.canShowGalleryLog())
         await this.logGallery.log(message, aux);
        Log.log(message, aux);
    }

    private StatePending(){
        this.state = Gallery.STATE_PENDING;
    }

    public StateWorkInProgress(){
        this.state = Gallery.STATE_WORK_IN_PROGRESS;
    }

    public StateDownloaded(){
        this.state = Gallery.STATE_DOWNLOADED;
    }

    public StateIrregularDownloaded(){
        this.state = Gallery.STATE_DOWNLOADED_IRREGULAR;
    }

    public StateError(){
        this.state = Gallery.STATE_ERROR;
    }

    public async createDirectories(): Promise<void> {
        await this.createDownloadDirectory();
        await this.createGalleryDirectory();
    }

    private async createDownloadDirectory(){
        await Directory.createDirSync(await System.getDownloadDirectory());
      }

    private async createGalleryDirectory(){
        await Directory.createDirSync(await this.getGalleryDir());
    }

    public async existsGalleryDirectory(): Promise<boolean>{
        let galleryDir = await this.getGalleryDir();
        return await Directory.existsSync(galleryDir);
        
    }

    public pushError(reference: string, message: string, aux?: string | string[]): void{
        const error = new Error(reference, message, aux);
        this.errors.push(error);
    }

    public incrementGallerySize(){
        if(this.gallerySize < 0)
          this.gallerySize = 0;
        this.gallerySize = this.gallerySize + 1;
    }

    public incrementPagePointer(){
        if(this.galleryPagePointer < 0)
          this.galleryPagePointer = 0;
        const nextPagePointer = this.galleryPagePointer + 1;
        //this.galleryPagePointer = nextPagePointer > this.galleryPagesSize ? this.galleryPagesSize : nextPagePointer;
        this.galleryPagePointer = this.galleryPagePointer + 1;
      }

      public isDownloadedSucessfull(): boolean{
        let state = this.getState();

        return state == Gallery.STATE_DOWNLOADED;
      }

      public async getDownloadSummary(): Promise<string>{
        let message = ` Gallery "${await this.getGalleryName()}": \n`;
            message += `  -URI: ${this.getBaseUri()}\n`;
            message += `  -Hostname: ${this.getHostName()}\n`;
            message += `  -Download location: ${Uri.resolve(await this.getGalleryDir())}\n`;
            message += `  -Final state: ${this.getState()}\n`;
            message += `  -Downloads: ${this.getGallerySize()}\n`;
            message += `  -Errors: ${this.getErrorCount()}\n`;

        if(this.getErrorCount() > 0){
            message += `  -Error messages:\n` ;
            for (const error of this.errors) {
                message += `   -${error.buildMessage()}\n` ;
            }
        }

        return message;
      }

}