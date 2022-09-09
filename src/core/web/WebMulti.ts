import { ConfigFile } from "../entities/ConfigFile";
import { Gallery } from "../entities/Gallery";
import { WebDriverMulti } from "../interfaces/WebDriverMulti";
import { GalleryMessages } from "../log/messages/GalleryMessages";

import { WebBasic } from "./WebBasic";

export class WebMulti extends WebBasic {

    protected driver: WebDriverMulti;
    private rearchedPages: number;

    public constructor(driver: WebDriverMulti, gallery: Gallery){
        super(driver, gallery);
        this.rearchedPages = 0;
    }

    public static getInstance(driver: WebDriverMulti, gallery: Gallery): WebBasic{
        return new WebMulti(driver, gallery);
      }

    protected async searchImageURIs(uri?: string): Promise<string> {
        uri = await super.searchImageURIs(uri);   
        
        this.incrementReachedPages();

        let nextPageUri = await this.driver.getWebNextPageUri(this.getPagePrincipal());
        const swCanReachNext = await this.canReachNext();

        if(nextPageUri && swCanReachNext){
            nextPageUri = uri + nextPageUri;

            this.log(GalleryMessages.GALEMESS0003, nextPageUri);

            await this.searchImageURIs(nextPageUri);
        }

        return uri;
    } 

    protected async setGalleryData(){
        await this.setGalleryPagesSize();
        super.setGalleryData();
    }

    protected async setGalleryPagesSize(){
        if(this.gallery.getGalleryPagesSize() == 0){
          const galleyPagesSize = await this.driver.getWebGalleryPagesSize(this.getPagePrincipal());

          this.gallery.setGalleryPagesSize(galleyPagesSize);
        }
    }

    private async canReachNext(): Promise<boolean>{
        const config = await ConfigFile.getInstance();
        const swPagesLimit = this.rearchedPages < config.getReachedPagesLimit();
        const swDownloadLimit = this.gallery.getStorageLength() <= config.getDownloadLimit();

        if(!swPagesLimit)
            this.log(GalleryMessages.GALEMESS0013, await this.gallery.getGalleryName());

        return swPagesLimit && swDownloadLimit;
    }

    private incrementReachedPages(): void{
        this.rearchedPages = this.rearchedPages + 1;
    }

}