import { CustomElement, html } from "../CustomElement.mjs";
import "./content/index.mjs";

export default class MainContent extends CustomElement {
  constructor() {
    super();
    self.instance = "";
  }
  static properties = {
    instance: {
      type: String,
    },
  };

  // Render the UI as a function of component state
  render() {
    return html` ${this.changeInternalElement()}`;
  }

  changeInternalElement() {    
    switch (this.instance) {
      case "translator": {
        return html`<content-translator></content-translator>`;
      }
      default: {
        return html`<to-do></to-do>`;
      }
    }
  }
}
customElements.define("main-content", MainContent);
