import { CustomElement, html } from "../CustomElement.mjs";

export default class SideButton extends CustomElement {
  constructor() {
    super();
    this.activated = false; // 初始状态
  }
  static properties = {
    activated: {
      type: Boolean,
    },
  };

  // Render the UI as a function of component state
  render() {
    return html`
      <button
        class="w-36 h-8 flex items-center justify-start p-2 hover:bg-gray-100 rounded-lg transition non-draggable ${this
          .activated
          ? "bg-gray-50"
          : ""}"
      >
        <span class="text"><slot></slot></span>
      </button>
    `;
  }
}
customElements.define("side-button", SideButton);
