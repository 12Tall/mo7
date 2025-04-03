import { CustomElement, html } from "../../CustomElement.mjs";
import OllamaModelSelector from "./ollama/model-selector.mjs";

export default class ContentTranslator extends CustomElement {
  constructor() {
    super();
    this._model = "";
    this._target_lang = "简体中文";
  }
  static properties = {
    _model: { type: String, state: true },
    _target_lang: { type: String, state: true },
  };

  // Render the UI as a function of component state
  render() {
    return html`
      <!-- <simple-greeting name="World!"></simple-greeting> -->
      <div
        class="h-full w-full flex flex-col justify-start items-start draggable p-2"
      >
        <textarea
          id="text_origin"
          class="w-full h-30 border-2  border-gray-400 rounded p-1"
          placeholder="源文本"
        ></textarea>
        <div class="flex m-2 justify-between  items-center w-full">
          <ollama-model-selector
            class="w-60"
            @select-changed="${this.onOllamaModelChanged}"
          ></ollama-model-selector>
          <button
            class="w-20 self-center bg-cyan-500 rounded p-1"
            @click="${this.translate}"
          >
            翻译
          </button>
          <div class="inline-block w-60 h-full">
            <label>目标语言</label>
            <input
              id="target_lang"
              type="text"
              class=" border rounded-sm border-gray-300 h-full w-30 p-1"
              .value="${this._target_lang}"
              placeholder="目标语言"
            />
          </div>
        </div>

        <textarea
          id="text_target"
          class="w-full h-40 border-2  border-gray-400 rounded p-1"
          placeholder="结果"
          readonly
        ></textarea>
      </div>
    `;
  }

  async translate() {
    const text_target = this.shadowRoot.querySelector("#text_target");
    if (!this._model) {
      text_target.value = "请选择模型";
      return;
    }
    const text_origin = this.shadowRoot.querySelector("#text_origin");
    const input_text = text_origin.value.trim();
    if (!input_text) {
      text_target.value = "请输入文本";
      return;
    }

    this._target_lang = this.shadowRoot.querySelector("#target_lang").value;

    const msg = {
      model: this._model,
      source_lang: "",
      target_lang: this._target_lang,
      input_text: input_text,
    };
    let resp = await this.ipcInvoke("ollama-translator", msg);
    text_target.value = resp.output_text;
  }

  onOllamaModelChanged(event) {
    this._model = event.detail.message;
  }
}
customElements.define("content-translator", ContentTranslator);
