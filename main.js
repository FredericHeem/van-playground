import "./style.css";
import vanLogo from "/vanjs.svg";
import viteLogo from "/vite.svg";
import van from "./van";

const { a, button, div, h1, img, p } = van.tags;

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
    div({ class: "card" }, button({ id: "counter", type: "button" })),
    p({ class: "read-the-docs" }, "Click on the Vite logo to learn more")
    //div({ a: undefined })
  );

const app = document.getElementById("app");
app.replaceChildren(App({}));
