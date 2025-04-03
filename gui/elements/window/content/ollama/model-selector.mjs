import { CustomElement, css, html } from "../../../CustomElement.mjs";

export default class OllamaModelSelector extends CustomElement {
  static properties = {
    items: { type: Array },
    selected: { type: String },
    isOpen: { type: Boolean },
  };

  constructor() {
    super();
    this.items = [];
    this.selected = "请选择模型";
    this.isOpen = false;
    this.addEventListener("focusout", this.onBlur);
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  // Render the UI as a function of component state
  render() {
    // 1. tabindex="0" + 自己监听focusout 可以判断shadowDOM 失去焦点的事件
    return html` <div class="inline-block relative w-full" tabindex="0">
      <!-- 
        relative 可以让元素整体相对布局 
        元素仍然占据原来的文档流位置
        可以使用 top / left / right / bottom 进行偏移
        不会影响其他元素的布局
      -->
      <input
        class="bg-cyan-500 rounded-sm p-1 w-full text-left"
        @click=${this.toggleDropdown}
        value="${this.selected}"
        readonly
      />
      <!-- 
        absolute 👉 让元素脱离正常文档流，相对于最近的 relative 父元素进行定位。
        left-0 👉 将元素的左侧对齐到父元素的 left: 0px 处。
        top-full 👉 让元素的顶部对齐到父元素的 bottom（即 100% 高度处）。
      -->
      <div
        class="absolute left-0 top-full bg-gray-50 w-full border border-gray-300 rounded-sm ${this
          .isOpen
          ? "block"
          : "hidden"}"
      >
        ${this.items.map(
          (item) => html`
            <div
              class="p-1 hover:bg-cyan-300"
              @click=${(event) => {
                this.selectItem(item.model);
              }}
            >
              ${item.model}
            </div>
          `
        )}
      </div>
    </div>`;
  }

  async fetchData() {
    try {
      const response = await this.ipcInvoke("ollama-model-list");
      this.items = response.models;
    } catch (error) {
      console.error("数据获取失败:", error);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectItem(item) {
    this.selected = item;
    this.isOpen = false;
    this.dispatchEvent(
      new CustomEvent("select-changed", {
        detail: { message: this.selected },
        bubbles: true, // 事件可以冒泡
        composed: true, // 事件可以穿透 Shadow DOM
      })
    );
  }

  onBlur(event) {
    this.isOpen = false;
  }
}
customElements.define("ollama-model-selector", OllamaModelSelector);
