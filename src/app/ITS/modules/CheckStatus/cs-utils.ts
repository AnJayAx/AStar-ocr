export class CsUtils {
    public static getDateFromDateS(dateString: string): string {
        return dateString.split(' ')[0];
    }
    
    public static getTimeFromDateS(dateString: string): string {
        return dateString.split(' ')[1];
    }
}
