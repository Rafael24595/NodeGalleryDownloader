import { AbstractException } from "./AbstractException";

export class Exception extends AbstractException{

    private static exception = "Exception";

    constructor(message: string, aux?:string | string[], err?:Error){
        super(Exception.exception, message, aux, err);
    }
    
}