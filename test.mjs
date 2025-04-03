import { Ollama } from "ollama";
import config from "./app.config.json" with {type:"json"}
const llm = new Ollama({
    host: config.ollama.base_url
})

const lst = await llm.list()  

console.log(lst)