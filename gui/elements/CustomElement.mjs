import { LitElement, css, html } from "./Lit.js";
import styles from '../index.css' with { type: 'css' }; 

export class CustomElement extends LitElement {
  static styles = [styles];
  // 触发electron 客户端事件
  ipcSend(channel, msg) {
    window.ipcSend(channel, msg);
  }
  // 远程异步函数调用，如果是纯Web 则可以通过重写该方法实现远程请求
  async ipcInvoke(channel, msg) {
   return await window.ipcInvoke(channel, msg);
  }
}

export {
  css,
  html,
};
