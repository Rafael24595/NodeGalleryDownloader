export class RegularExpresion {

    public static REGEXP_DATE = "(?:(?:\\d{2}\\-){2}\\d{2})";

    public static generalLogName(): RegExp{
        const dateTime = `${this.REGEXP_DATE}_${this.REGEXP_DATE}`;
        const logFile = `Log-\\[${dateTime}\\]\\.txt`;
        return new RegExp(logFile);
    }

}