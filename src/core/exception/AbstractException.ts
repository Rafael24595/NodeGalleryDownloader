import { Log } from "../log/Log";
import { Message } from "../entities/Message";
import { Tools } from "../Utils/Tools";
import { HeaderMessages } from "../log/messages/HeaderMessages";

export class AbstractException extends Error {
    
    public name = "AbstractNewsletterException";
    private messageInstance: Message;

    protected constructor(name:string, message:string, aux?:string | string [], err?:Error){
        super();
        
        this.messageInstance = Message.buildMessage(message, aux);
        this.message = this.messageInstance.getCompleteMessage();
        this.name = name;

        if(err && !Tools.isEmptyString(err.stack)){
            this.stack = `${this.stack}\n\tat -> ${err.stack}`;
        }

        /*if(!Tools.isEmptyString(this.stack)){
            this.message = `${this.stack}`;
        }*/

        this.writeLog();
    }
    
    private writeLog():void{
        Log.log(HeaderMessages.exception.custom, [this.name.toUpperCase(), `${this.stack}`]);
    }
    
}