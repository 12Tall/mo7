import { CustomElement, html } from "../../CustomElement.mjs";

export default class ContentTranslator extends CustomElement {
  constructor() {
    super();
  }
  static properties = {};

  // Render the UI as a function of component state
  render() {
    return html`
      <!-- <simple-greeting name="World!"></simple-greeting> -->
      <div
        class="h-full w-full flex flex-col justify-start items-start draggable p-2"
      >
        <textarea
          id="text_origin"
          class="w-full h-40 border-2  border-gray-400 rounded p-1"
          placeholder="源文本"
        ></textarea>
        <button
          class="w-20 self-center m-2 bg-cyan-500 rounded p-1 text-sm"
          @click="${this.translate}"
        >
          翻译
        </button>
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
    const text_origin = this.shadowRoot.querySelector("#text_origin");
    const input_text = text_origin.value.trim();
    if (input_text) {
      const msg = {
        source_lang: "简体中文",
        target_lang: "English",
        input_text: input_text,
      };
      let resp = await this.ipcInvoke("ollama-translator", msg);
      this.shadowRoot.querySelector("#text_target").value = resp.output_text;
    }
  }
}
customElements.define("content-translator", ContentTranslator);
