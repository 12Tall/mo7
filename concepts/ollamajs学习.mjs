import { Ollama } from "ollama";
import { ChromaClient, OllamaEmbeddingFunction } from 'chromadb'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import fs from 'fs/promises';
import config from "./app.config.json" with {type: "json"}

const reload_data = false

// 更新嵌入数据库  
// 加载远程嵌入引擎
const embedder = new OllamaEmbeddingFunction({
    url: config.ollama.base_url,
    model: 'nomic-embed-text'
})
// 连接嵌入数据库
const client = new ChromaClient({
    // path: 'http://localhost:8000'
})
// 获取/创建collection
let collection = await client.getOrCreateCollection({
    name: 'self_introduce',
    embeddingFunction: embedder
})

// 是否需要重新装载数据
if (reload_data) {
    // 准备文本内容
    const text = await fs.readFile('sample.txt', 'utf-8');
    // 按循环切片
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 500,
    });
    const chunks = await splitter.splitText(text);

    // 填入内容
    await collection.delete()  // 先清空
    chunks.forEach(async (v, i) => {
        await collection.upsert({
            documents: [v],
            ids: [i.toString()]
        })
    })
}


// 连接llama 模型
const llm = new Ollama({
    host: config.ollama.base_url
})

let question = ' 李楚的身世如何？'

const results = await collection.query({
    queryTexts: question, // Chroma will embed this for you
    nResults: 10, // how many results to return
});

// 
let template = `
清除所有记忆。
请根据以下内容： 
${results.documents.join('\n\n')}

总结并回答用户的问题。
`
// console.log(template);

const resp = await llm.chat({
    model: 'llama3.3',
    messages: [
        { role: "system", content: template },
        { role: 'user', content: question }
    ],
    stream: false
})


console.log(resp);
