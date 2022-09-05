export class Tools {

    public static isEmptyString(string: string | undefined | null): boolean{
        return (string == null || string == undefined || string == "");
    }

    public static isNumber(value: any): boolean{
        return typeof value == "number";
    }

    public static isString(value: any): boolean{
        return typeof value == "string";
    }

    public static isBoolean(value: any): boolean{
        return typeof value == "boolean";
    }

}