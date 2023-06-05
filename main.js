import "./style.css";
import van from "./van";
import vanArray from "./van-array";

const { a, button, div, ul, li, input, span } = van.tags;

const arr = ["wash laundry", "do stuff"];

const App = () => {
  const inputState = van.state("");
  const proxyArray = vanArray.stateArray(arr)

  return div(
    "Test Observable Array",

    div(
      button(
        {
          onclick: () => {
            proxyArray.val.push(inputState.val)
          },
        },
        "Push"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val.pop()
          },
        },
        "Pop"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val.shift()
          },
        },
        "Shift"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val.unshift(inputState.val)
          },
        },
        "Unshift"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val.splice(1, 2, "foo")
          },
        },
        "Splice 1 2 foo"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val[0] = "bar"
          },
        },
        "arr[0] = 'bar'"
      ),
      button(
        {
          onclick: () => {
            proxyArray.val = ["bar"]
          },
        },
        "arr = ['bar']"
      ),

      div(input({
        id: "my-id",
        text: "text",
        value: inputState,
        oninput: (event) => inputState.val = event.target.value
      })),
      van.bind(proxyArray, (array) => {
        return div("Items Count ", array.length)
      }),
      vanArray.bindArray({
        deps: [proxyArray],
        renderContainer: ({ values: [arr], renderItem }) => {
          return ul(arr.map(value => renderItem({ value })))
        },
        renderItem: ({ value, deps }) => {
          return li(value)
        }
      })
    )
  );
};

const app = document.getElementById("app");
app.replaceChildren(App({}));
