import { Message } from "../../entities/Message";

const AUX = Message.auxReplace

export class GalleryMessages {

    public static readonly GALEMESS0001 = `Downloading gallery '${AUX}': \n`;
    public static readonly GALEMESS0002 = `- Page path - ${AUX+1}/${AUX+2} => ${AUX+3}`;
    public static readonly GALEMESS0003 = `- Next page path => ${AUX}`;
    public static readonly GALEMESS0004 = `  - Page image path - ${AUX+1}/${AUX+2} of ${AUX+3}/${AUX+4} ==> ${AUX+5}`;
    public static readonly GALEMESS0005 = `Saving file: ${AUX}`;
    public static readonly GALEMESS0006 = `\n- Gallery download ${AUX+1}: Total pictures ${AUX+2}\n`;
    public static readonly GALEMESS0007 = `Cannot download gallery '${AUX}' more than once, check the configuration file.`;
    public static readonly GALEMESS0008 = `Cannot override file '${AUX}', check the configuration file.`;
    public static readonly GALEMESS0009 = `-File '${AUX+1}' already exists and cannot override it, created with new name '${AUX+2}'`;
    public static readonly GALEMESS0010 = `Limit of file name variables exceeded, pull over the files of directory.`;
    public static readonly GALEMESS0011 = `Cannot force the download of non work in progress gallery: "${AUX}".`;
    public static readonly GALEMESS0012 = `Limit of downloads per gallery exceeded for "${AUX}".`;
    public static readonly GALEMESS0013 = `Limit of reached pages per gallery exceeded for "${AUX}".`;
}