import { Ollama } from "ollama";
import config from "../../app.config.json" with {type:"json"}
const ollama = new Ollama({ host: config.ollama.base_url });
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const TranslatorMsg = z.object({
  model: z
    .string()
    .readonly()
    .describe("model name"),
  source_lang: z
    .string()
    .readonly()
    .describe("origin language of the input text"),
  target_lang: z
    .string()
    .readonly()
    .describe("target language of the output text"),
  input_text: z.string().readonly().describe("input_text, unchangable"),
  output_text: z.string().default("").describe("output_text filed, please put translation here"),
});
const TranslatorMsgSchema = zodToJsonSchema(TranslatorMsg);

export async function OllamaTranslationHandler(event, msg) {
  msg = TranslatorMsg.parse(msg);

  let rsp = await ollama.chat({
    model: msg.model,
    messages: [
      {
        role: "user",
        content: `translate the following sentences(as input_text) from ${
          msg.source_lang ?? "auto detect"
        } to ${
          msg.target_lang ?? "Simply Chinese"
        }, and put the translation as 'output_text' field:\n\n${msg.input_text}\n\n `,
      },
    ],
    format: TranslatorMsgSchema,
    stream: false,
    options: {
      temperature: 0,
    },
  });
  
  rsp = TranslatorMsg.parse(JSON.parse(rsp.message.content));
  msg.output_text = rsp.output_text??"翻译失败！"

  return msg;
}

export async function getModelList(){
    return await ollama.list()  
}