import "./style.css";
import vanLogo from "/vanjs.svg";
import viteLogo from "/vite.svg";
import van from "./van";

const { a, button, div, h1, img, p, input } = van.tags;

const counter = van.state(0);
const inputState = van.state("");

const App = () =>
  div(
    a(
      { href: "https://vitejs.dev", target: "_blank" },
      img({ src: viteLogo, class: "logo", alt: "Vite logo" })
    ),
    a(
      {
        href: "https://vanjs.org",
        target: "_blank",
      },
      img({
        src: vanLogo,
        class: "logo vanilla",
        alt: "JavaScript logo",
      })
    ),
    h1("Van.js app built with Vite!"),
    div(
      { class: "card" },
      button(
        {
          id: "counter",
          type: "button",
          onclick: (event) => {
            counter.val++;
          },
        },
        "Click"
      )
    ),
    p("Counts ", counter),
    input({
      type: "text",
      name: "my-input",
      value: inputState.val,
      oninput: (event) => {
        inputState.val = event.target.value;
      },
    }),
    p({ id: inputState }, "Value: ", inputState)
    //div({ a: undefined })
    //div(undefined)
  );

const app = document.getElementById("app");
app.replaceChildren(App({}));
