import { Message } from "./Message";
import { Transform } from "../Utils/Transform";

export class Error {

    private reference: string;
    private message: Message;
    private date: number;

    public constructor(reference: string, message: string, aux?: string | string[]){
        this.reference = reference;
        this.message = Message.buildMessage(message, aux);
        this.date = Date.now();
    }

    public getReference(): string{
        return this.reference;
    }

    public getMessage(): string{
        return this.message.getCompleteMessage();
    }

    public getDate(): string{
        const date = Transform.integerToDayMonthYear(this.date);
        const time = Transform.integerToHourMinutesSeconds(this.date);
        return  `${date} - ${time}`;
    }

    public buildMessage(): string{
        const date = this.getDate();
        const message = this.getMessage();
        return `Error reference: ${this.reference} -> "${message}" at ${date}.`;
    }

}