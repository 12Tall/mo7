import { CustomElement, css, html } from '../../CustomElement.mjs';

export default class Todo extends CustomElement {
  createRenderRoot() {
    return this
  }

  static properties = {
    name: {},
    _arr: {}
  };

  constructor() {
    super();
    // Declare reactive properties
    this.name = 'World';
    this._arr = [123, 456]
  }

  // Render the UI as a function of component state
  render() {
    return html`<p>To Do.</p>`;
  }

  add(e) {
    this._arr.push(123)
    console.log(this._arr);
    this.requestUpdate()
  }
}
customElements.define('to-do', Todo);


