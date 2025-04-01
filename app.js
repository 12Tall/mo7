import { Application } from "./main/app.mjs";


const app = new Application({
  width: 1200,
  height: 800,  
  minWidth: 800, // 最小宽度
  minHeight: 600, // 最小高度
  icon: "resources/app.png",
  title: "MO7",
  // frame: false,
})

app.run()
console.log("Hello from Electron 👋");
