import { CustomElement, html } from "../CustomElement.mjs";

export default class SideBar extends CustomElement {
  constructor() {
    super();
  }

  // Render the UI as a function of component state
  render() {
    return html`
      <div class="h-full flex flex-col justify-start items-start draggable p-2">
        <div class="mb-2">
            <img src="./resources/app.png"  alt="Avatar" class="w-10 h-10 rounded-full non-draggable self-center"/>
        </div>
        <slot></slot>
      </div>
    `;
  }

  hide() {
    this.ipcSend("mainWindow", "hide");
  }
}
customElements.define("side-bar", SideBar);
