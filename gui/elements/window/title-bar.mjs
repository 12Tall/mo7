import { CustomElement, html } from "../CustomElement.mjs";

export default class TitleBar extends CustomElement {
  constructor() {
    super();
  }

  // Render the UI as a function of component state
  render() {
    return html`
      <div class="w-full h-8 flex justify-end items-start draggable">
        <button
          class="w-6 h-6 flex items-center justify-center hover:bg-gray-600 rounded transition non-draggable"
          @click="${this.min}"
        >
          <span class="text-sm">🗕</span>
        </button>

        <!-- 最大化/还原 -->
        <button
          class="w-6 h-6 flex items-center justify-center hover:bg-gray-600 rounded transition non-draggable"
          @click="${this.max}"
        >
          <span class="text-sm">🗖</span>
        </button>

        <!-- 关闭 -->
        <button
          class="w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition non-draggable"
          @click="${this.hide}"
        >
          <span class="text-sm">🗙</span>
        </button>
      </div>
    `;
  }

  hide() {
    window.ipcSend("mainWindow", "hide");
  }
  min() {
    window.ipcSend("mainWindow", "min");
  }
  max() {
    window.ipcSend("mainWindow", "max");
  }
}
customElements.define("title-bar", TitleBar);
