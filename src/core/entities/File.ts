import fs from "fs";
import http from "http";
import https from "https";
import { System } from "./System";
import { Tools } from "../Utils/Tools";
import { Uri } from "./Uri";
import { Log } from "../log/Log";
import { HeaderMessages } from "../log/messages/HeaderMessages";
import { Exception } from "../exception/Exception";
import { Messages } from "../log/messages/Messages";

export class File extends System {

    public static async writeSync(path: string, content: string){
        fs.writeFileSync(path, content);
    }
  
    public static async readSync(path: string){
      let content = "";

      if(await this.existsSync(path)){
        content = fs.readFileSync(path).toString();
        //await Log.log(HeaderMessages.file.read, path);
      }
      
      return content;
    }

    public static async removeSync(path: string): Promise<void>{
      return fs.unlinkSync(path);
    }

    public static writeStream(response: http.IncomingMessage, systemPath:string){
        const fileStream = fs.createWriteStream(systemPath);
        response.pipe(fileStream);
  
        fileStream.on("error", (error)=>{
          console.log(error)
        });
  
        fileStream.on("close", ()=>{
          
        });
  
        fileStream.on("finish", ()=>{
          fileStream.close();
        });
    }

    public static async download(uri: string, systemPath?: string){
      systemPath = await this.valideSystemPath(uri, systemPath);

      https.get(uri, async (response)=>{
        this.writeStream(response, systemPath as string)});
    }

    public static async downloadSync(uri: string, systemPath?: string){
      systemPath = await this.valideSystemPath(uri, systemPath);

      await new Promise((resolve) => {
        https.get(uri, async (response)=>{
          const fileStream = fs.createWriteStream(systemPath as string);
          response.pipe(fileStream);
    
          fileStream.on("error", (error)=>{
            console.log(error);
            resolve(false);
          });
    
          fileStream.on("close", ()=>{
            resolve(false);
          });
    
          fileStream.on("finish", ()=>{
            fileStream.close();
            resolve(true);
          });
        });
      });
    }

    private static async valideSystemPath(uri: string, systemPath?: string): Promise<string>{
      if(Tools.isEmptyString(systemPath)){
        const fileName = Uri.cleanBasename(uri);
        
        if(Tools.isEmptyString(Uri.extension(fileName)))
          throw new Exception(Messages.LOGMESSA0003, fileName);

        systemPath = await System.getDownloadDirectory() + fileName;
      }

      return systemPath as string;
    }

}