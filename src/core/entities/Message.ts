import { Auxiliar } from "../type/Auxiliar";

export class Message {

    public static readonly auxReplace = "&var";

    private message:string;
    private aux: Auxiliar;

    private constructor(message: string, aux?: Auxiliar){
        this.message = message;
        this.aux = aux ? aux : "";
    }

    public getCompleteMessage(): string{
        return this.replaceAux();
    }

    public static buildMessage(message: string, aux?: Auxiliar): Message{
        return new Message(message, aux);
    }

    private replaceAux():string{
        const auxValues = (!Array.isArray(this.aux)) ? [this.aux] : this.aux;
        let auxMessage = this.message;
        
        for (let index = 0; index < auxValues.length; index++) {
            const logAux = (auxValues.length > 1) ? `${Message.auxReplace}${(index + 1)}` : Message.auxReplace;
            const regex = new RegExp(logAux, "g");
            const auxValue = auxValues[index];
            auxMessage = auxMessage.replace(regex, auxValue);
        }

        return auxMessage;
    }

}