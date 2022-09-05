export class Transform {

    public static formatNumber(length: number, value: number): string{
        let formatedNumber = `${value}`;

        for(let index = 0; index < length; index++){
            if(value < 10 * index){
               formatedNumber = `0${formatedNumber}`; 
            }
        }

        return formatedNumber;
    }

    public static integerToDayMonthYear(dateInt: number, divider?: string): string{
        let date = new Date(dateInt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          });

        if(divider)
          date = this.replaceDateDivider(date, divider);

        return date;
    }

    public static integerToHourMinutesSeconds(dateInt: number, divider?: string): string{
        let date = new Date(dateInt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        if(divider)
            date = this.replaceTimeDivider(date, divider);

        return date;
    }

    private static replaceDateDivider(date: string, divider: string): string{
        const regex = new RegExp("/", 'g');
        return date.replace(regex,divider);
    }

    private static replaceTimeDivider(date: string, divider: string): string{
        const regex = new RegExp(":", 'g');
        return date.replace(regex,divider);
    }

}