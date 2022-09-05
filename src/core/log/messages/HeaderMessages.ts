import { Message } from "../../entities/Message";

const AUX = Message.auxReplace;

export class HeaderMessages {
    
    public static readonly misc = {
        information: `[PROCESS-INFO] ${AUX}.`,
        error: `[PROCESS-ERROR] ${AUX}.`
    }

    public static readonly exception = {
        custom:`[EXCEPTION-${AUX+1}] ${AUX+2}`
    }

    public static readonly network ={
        get: `[NETWORK-REQUEST] GET request for "${AUX}"`,
        error:{
            basic:`[NETWORK-ERROR] ${AUX}`,
            uri:`[NETWORK-ERROR] Error network[${AUX+1}] for "${AUX+2}"`
        }
    }

    public static readonly file = {
        open:`[FILE-OPEN] Opening file "${AUX}"`,
        read:`[FILE-READ] Reading file "${AUX}".`,
        save:`[FILE-SAVE] Saving file "${AUX}".`,
        remove:`[FILE-REMOVE] Removing file "${AUX}".`,
        error:{
            read:`[FILE-ERROR] An error has ocurred while reading the file "${AUX}".`,
            save:`[FILE-ERROR] An error has ocurred while writing to the file "${AUX}".`,
            remove:`[FILE-ERROR] An error has ocurred while trying to remove the file "${AUX}".`
        }
    }

}