import puppeteer from "puppeteer";

export abstract class WebDriverBasic {
    protected abstract readonly userAgent: string;
    protected abstract readonly swImagePagePreview: boolean;
    public abstract getUserAgent(): string;
    public abstract hasImagePagePreview(): boolean;
    public abstract getWebPageImagesURIs(page: puppeteer.Page): Promise<string[]>;
    public abstract getWebPageImageURI(page: puppeteer.Page): Promise<string[]>;
}