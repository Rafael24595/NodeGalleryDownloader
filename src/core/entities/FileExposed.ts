import fs from "fs";

export class FileExposed {

    private id: number;

    private constructor(id: number){
        this.id = id;
    }

    public static expose(path: string, flags: fs.OpenMode){
        const id = fs.openSync(path, flags);

        return new FileExposed(id);
    }

    public async write(content: string){
        return fs.writeFileSync(this.id, content);
    }

    public close(){
        return fs.closeSync(this.id);
    }

}