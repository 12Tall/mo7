import { CustomElement, html } from "../CustomElement.mjs";

export default class SideMenu extends CustomElement {
  constructor() {
    super();
    this.activatedIndex = 0; // 初始状态
  }
  static properties = {
    activatedIndex: {
      type: String,
    },
  };

  // Render the UI as a function of component state
  render() {
    return html`
      <div @click="${this.onClick}">
        <slot></slot>
      </div>
    `;
  }

  /**
   *
   * @param {Event} event
   */
  onClick(event) {
    if (event.target != event.currentTarget) {
      this.shadowRoot
        .querySelector("slot")
        .assignedElements()
        .forEach((ele) => {
          ele.removeAttribute("activated");
        });

      const ele = event.target;
      ele.setAttribute("activated", true);
      this.dispatchEvent(
        new CustomEvent("side-menu-change", {
          detail: { message: ele.dataset.index },
          bubbles: true, // 事件可以冒泡
          composed: true, // 事件可以穿透 Shadow DOM
        })
      );
    }
    event.preventDefault();
  }

  firstUpdated() {
    let index = this.activatedIndex;
    this.shadowRoot
      .querySelector("slot")
      .assignedElements()
      .forEach((ele) => {
        ele.removeAttribute("activated");
        if (ele.dataset.index == index) {
          ele.setAttribute("activated", true);
        }        
      });
  }
}
customElements.define("side-menu", SideMenu);
