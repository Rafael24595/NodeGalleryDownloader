import { Message } from "../../entities/Message";

const AUX = Message.auxReplace;

export class Messages {
    
    public static readonly LOGMESSA0001 = `Cached log file removed "${AUX}".`;
    public static readonly LOGMESSA0002 = `Process end:\n\n${AUX+1}\n${AUX+2}`;
    public static readonly LOGMESSA0003 = `Invalid download file name: "${AUX}".`
    
}