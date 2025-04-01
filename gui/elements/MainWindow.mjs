import { CustomElement, html } from "./CustomElement.mjs";

import "./window/content/todo.mjs";
import "./navgators/index.mjs";
import { Content } from "./window/index.mjs";

export default class MainWindow extends CustomElement {
  constructor() {
    super();
    this._instance = "translator";
  }
  static properties = {
    _instance: {
      type: String,
      state: true,
    },
  };

  // Render the UI as a function of component state
  render() {
    return html`<div
      class="w-screen h-screen flex bg-gray-200 draggable"
      @side-menu-change="${this.sideMenuChangeHandler}"
    >
      <side-bar class="w-40 h-full p-1">
        <side-menu activatedIndex="${this._instance}">
          <side-button data-index="translator">翻译工具</side-button>
          <side-button data-index="todo">Todo</side-button>
        </side-menu>
      </side-bar>
      <div class="flex-1 flex flex-col h-full p-2">
        <title-bar></title-bar>
        <main-content
          id="main-content"
          instance="${this._instance}"
          class="flex-1 w-full bg-gray-50 rounded-lg p-2 overflow-x-hidden overflow-y-auto non-draggable"
        >
        </main-content>
      </div>
    </div>`;
  }

  sideMenuChangeHandler(event) {
    const index = event.detail.message;
    if (this._instance != index) {
      this._instance = index;
    }
  }
}
customElements.define("main-window", MainWindow);
