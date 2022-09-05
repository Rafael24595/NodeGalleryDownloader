import puppeteer from "puppeteer";

import { File } from "../entities/File";
import { Tools } from "../Utils/Tools";
import { Uri } from "../entities/Uri";
import { Gallery } from "../entities/Gallery";
import { ConfigFile } from "../entities/ConfigFile";
import { Directory } from "../entities/Directory";
import { Exception } from "../exception/Exception";
import { GalleryMessages } from "../log/messages/GalleryMessages";
import { Auxiliar } from "../type/Auxiliar";
import { WebDriverBasic } from "../interfaces/WebDriverBasic";

export class WebBasic {

  private browser:puppeteer.Browser;
  private pagePrincipal: puppeteer.Page;
  protected driver: WebDriverBasic;

  protected gallery: Gallery;

  protected constructor(driver: WebDriverBasic, gallery: Gallery){
    this.driver = driver;
    this.gallery = gallery;
  }

  public static getInstance(driver: WebDriverBasic, gallery: Gallery): WebBasic{
    return new WebBasic(driver, gallery);
  }

  protected getPagePrincipal(): puppeteer.Page{
    return this.pagePrincipal;
  }

  protected async getWebImagesSrc(): Promise<string[]>{
      let pics: string[] = [];
      let imagePointer = 0;

      let linkReferences = await this.driver.getWebPageImagesURIs(this.pagePrincipal);
      let index = 0;
      let swLimitExceeded = false;

      while(index < linkReferences.length && !swLimitExceeded){
        const linkReference = linkReferences[index];
        imagePointer = imagePointer + 1;
        
        await this.log(GalleryMessages.GALEMESS0004, [imagePointer, linkReferences.length, this.gallery.getGalleryPagePointer(), this.gallery.getGalleryPagesSize(), linkReference]);
  
        let picsAux = await this.getWebImageSrc(linkReference);
        pics = pics.concat(picsAux);

        swLimitExceeded = await this.isLimitExceeded(pics);
        index = index + 1;
      }
      
      return pics;
  }

  private async isLimitExceeded(pics: string[]): Promise<boolean>{
    const config = await ConfigFile.getInstance();
    const totalURIs = pics.length + this.gallery.getStorageLength();
    const swLimitExceeded = totalURIs >= config.getDownloadLimit();
    
    if(swLimitExceeded)
      await this.log(GalleryMessages.GALEMESS0012, await this.gallery.getGalleryName());

    return swLimitExceeded;
  }

  protected async getWebImageSrc(linkReference: string): Promise<string[]>{
    let picsAux: string[];

    if(this.driver.hasImagePagePreview()){
      let auxImage = await this.browser.newPage();
      await auxImage.goto(linkReference);

      picsAux = await this.driver.getWebPageImageURI(auxImage);

      await auxImage.close();
    }
    else{
      picsAux = [linkReference];
    }

    return picsAux;
  }

  private getDownloadedState(){
    switch(this.gallery.getState()){
      case Gallery.STATE_DOWNLOADED:
        return "successfully";
      case Gallery.STATE_PENDING:
        return "remains pending";
      case Gallery.STATE_WORK_IN_PROGRESS:
        return "has not finished";
      default:
        return "with errors";
    }
  }

  private setGalleryDownloadedState(){
    if(this.gallery.getErrorCount() < 1)
          this.gallery.StateDownloaded();
    else
      this.gallery.StateIrregularDownloaded();
  }

  public async downloadGallery(): Promise<void>{
    this.gallery.StateWorkInProgress();
    let canDownloadGallery = await this.canDownloadGallery();

    if(canDownloadGallery){
      let galleryName = await this.gallery.getGalleryName();
      
      await this.log(GalleryMessages.GALEMESS0001, galleryName)

      await this.initializePagePrincipal();
      await this.searchImageURIs();
      await this.downloadImages();

      this.setGalleryDownloadedState();

      await this.log(GalleryMessages.GALEMESS0006, [this.getDownloadedState(), `${this.gallery.getGallerySize()}`]);
    }
    else{
      await this.log(GalleryMessages.GALEMESS0007, await this.gallery.getGalleryName());
      this.gallery.StateError();
    }
  }

  public async forceDownload() {
    if(this.gallery.getState() == Gallery.STATE_WORK_IN_PROGRESS)
      await this.downloadImages();
    else
      throw new Exception(GalleryMessages.GALEMESS0011, await this.gallery.getGalleryName());
  }

  private async canDownloadGallery(): Promise<boolean>{
    let configInstance = await ConfigFile.getInstance();

    const swGalleryDirExists = await this.gallery.existsGalleryDirectory();
    const canGalleryDownloadTwice = configInstance.canGalleryDownloadTwice();
    const canGalleryDownloadInRoot = configInstance.canGalleryDownloadInRoot();

    return canGalleryDownloadTwice || (!canGalleryDownloadTwice && !swGalleryDirExists) || canGalleryDownloadInRoot;
  }

  private async initializePagePrincipal() {
    await this.launchBrowser()
    this.pagePrincipal = await this.browser.newPage();
  }

  private async launchBrowser(): Promise<void>{
    if(this.browser == undefined)
        this.browser = await puppeteer.launch();
  }

  protected async searchImageURIs(uri?: string): Promise<string> {
      uri = (!Tools.isEmptyString(uri)) ? uri as string : this.gallery.getBaseUri();

      await this.goToURI(uri);
      await this.setGalleryData();

      await this.log(GalleryMessages.GALEMESS0002, [this.gallery.getGalleryPagePointer(), this.gallery.getGalleryPagesSize(), uri]);

      let newImageURIs = await this.getWebImagesSrc();
      this.gallery.pushImageURIs(newImageURIs);

      return uri;
  } 

  protected async setGalleryData(){
    this.gallery.incrementPagePointer();
    if(this.gallery.getGalleryPagesSize() == 0)
      this.gallery.setGalleryPagesSize(1);
  }  

  private async goToURI(uri: string): Promise<void>{
    if(!Tools.isEmptyString(this.driver.getUserAgent()))
      await this.pagePrincipal.setUserAgent(this.driver.getUserAgent());
    await this.pagePrincipal.goto(uri);
  }

  private async downloadImages(){    
      await this.gallery.createDirectories();
  
      if(this.gallery.getImageURIs().length < 1)
        this.gallery.pushError("Download references", "No files found check the module configuration.");

      for await (let imageURI of this.gallery.getImageURIs()){
          await this.downloadImage(imageURI);
      }
  }

  private async downloadImage(imageUri: string){
    try {
      const filePath = await this.generateDownloadPath(imageUri);

      await this.log(GalleryMessages.GALEMESS0005, filePath);
      await File.downloadSync(imageUri, filePath);

      this.gallery.incrementGallerySize();
    } catch (error: any) {
      this.gallery.pushError(imageUri, error.message);
      await this.log(error.message);
    }
  }

  private async generateDownloadPath(imageUri: string): Promise<string>{
    const configInstance = await ConfigFile.getInstance();
    let filePath = await this.buildDownloadPath(imageUri);
    let swPathExists = await Directory.existsSync(filePath);
    
    if(swPathExists && configInstance.canImageOverride() && !configInstance.canImageDownloadTwice())
      throw new Exception(GalleryMessages.GALEMESS0008, imageUri);

    if(swPathExists && !configInstance.canImageOverride()){
      filePath = await this.searchDownloadPathAvailable(imageUri);
    }

    return filePath;
  }

  private async searchDownloadPathAvailable(imageUri: string): Promise<string>{
    let filePath = await this.buildDownloadPath(imageUri);
    let originalPath = filePath;

    let swPathExists = await Directory.existsSync(filePath);
    let index = 1;

    for (index; swPathExists && index < 999; index++) {
      if(swPathExists){
        filePath = await this.buildDownloadPath(imageUri, index);
      }

      swPathExists = await Directory.existsSync(filePath);
    }

    if(index > 1){
      if(swPathExists && index == 999)
        throw new Exception(GalleryMessages.GALEMESS0010);
      await this.log(GalleryMessages.GALEMESS0009, [originalPath, filePath]);
    }

    return filePath;
  }

  private async buildDownloadPath(imageUri: string, index?: number){
    const fullFileName = Uri.cleanBasename(imageUri);

    let fileName = Uri.cleanName(fullFileName);
    let fileExtension = Uri.extension(fullFileName);

    let indexString = ""
    if(index && index > 0)
      indexString = `(${index})`;

    return `${await this.gallery.getGalleryDir()}${fileName}${indexString}.${fileExtension}`;
  }

  protected async log(message: string, aux?: Auxiliar){
    await this.gallery.log(message, aux);
  }

}