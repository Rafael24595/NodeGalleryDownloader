import { Dictionary } from "../../modules/Dictionary";
import { Gallery } from "../entities/Gallery";
import { Message } from "../entities/Message";
import { WebBasic } from "./WebBasic";
import { WebMulti } from "./WebMulti";
import { WebDriverMulti } from "../interfaces/WebDriverMulti";

export class FactoryWeb {

    public static getInstance(gallery: Gallery): WebBasic | undefined{
        const hostName = gallery.getHostName();
        const instance = Dictionary.Modules[hostName];

        if(instance != undefined){
            if(instance.prototype instanceof WebDriverMulti)
                return WebMulti.getInstance(new instance() as WebDriverMulti, gallery);
            else
                return WebBasic.getInstance(new instance(), gallery);
        }

        gallery.StateError();
        gallery.pushError("HostName", `Module not found for host-name '${Message.auxReplace}'.`, hostName);
    }

}