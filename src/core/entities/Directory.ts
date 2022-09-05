import fs from "fs";
import { System } from "./System";

export class Directory extends System {

    public static async createDirSync(dir: string): Promise<boolean>{
      if(!fs.existsSync(dir))
          fs.mkdirSync(dir);
        return true;      
    }

    public static async readDirSync(dir: string): Promise<string[]>{
      return fs.readdirSync(dir);
    }

}