import path from "path";

export class Uri {

    public static join(...paths: string[]): string{
        return path.join(...paths);
    }

    public static resolve(uri:string){
        return path.resolve(uri);
    }

    public static dirName(uri: string): string{
        return path.dirname(uri);
    }

    public static hostName(uri: string): string{
        let url = new URL(uri);
        return url.hostname;
    }

    public static extension(uri: string){
        return path.extname(uri).replace(".", "");
    }

    public static cleanName(uri: string){
        return path.basename(uri)
            .split('.')
            .slice(0, -1)
            .join('.')
    }

    public static cleanBasename(uri: string): string{
        uri = uri.trim();
        const cleanUri = this.cleanQuery(uri);
        let basename = path.basename(cleanUri);
        return basename;
      }

    public static cleanQuery(uri: string){
        let uriFragments = uri.split("?");
        return uriFragments[0];
    }

}