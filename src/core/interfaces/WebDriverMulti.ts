import puppeteer from "puppeteer";

import { WebDriverBasic } from "./WebDriverBasic";

export abstract class WebDriverMulti extends WebDriverBasic {
    public abstract getWebGalleryPagesSize(page: puppeteer.Page): Promise<number>;
    public abstract getWebNextPageUri(page: puppeteer.Page): Promise<string>;
}