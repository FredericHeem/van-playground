import { addAndScheduleOnFirst, toDom } from "./van";

let changedStatesVector;

// array is mutated with the following functions. These functions tracked an array thanks to a Javascript Proxy.
// TODO add sort
const arrayOperationMutation = ["splice", "push", "pop", "shift", "unshift"];

const createArrayProxy = (_state, initVal) =>
  new Proxy(initVal, {
    get(target, prop, receiver) {
      if (arrayOperationMutation.includes(prop)) {
        const origMethod = target[prop];
        return (...args) => {
          const oldArray = structuredClone(target);
          const result = origMethod.apply(target, args);
          _state.arrayOps.push({
            method: prop,
            args,
            newArray: target,
            oldArray,
          });
          changedStatesVector = addAndScheduleOnFirst(
            changedStatesVector,
            _state,
            updateDomsArray
          );
          return result;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, val, receiver) {
      //const oldArray = structuredClone(target);
      const result = Reflect.set(target, prop, val, receiver);
      _state.arrayOps.push({
        method: "set",
        args: [prop, val],
        //newArray: target,
        //oldArray,
      });
      changedStatesVector = addAndScheduleOnFirst(
        changedStatesVector,
        _state,
        updateDomsArray
      );
      return result;
    },
  });

let stateArrayProto = {
  get val() {
    return this._val;
  },
  set val(newArray) {
    const oldArray = this._val;
    this._val = createArrayProxy(this, newArray);
    this.arrayOps.push({
      method: "assign",
      args: newArray,
      newArray: newArray,
      oldArray,
    });
    changedStatesVector = addAndScheduleOnFirst(
      changedStatesVector,
      this,
      updateDomsArray
    );
  },
};

let stateArray = (initVal) => {
  const _state = {
    oldVal: initVal,
    bindings: [],
    bindings: [],
    listeners: [],
    arrayOps: [],
  };

  return {
    ..._state,
    __proto__: stateArrayProto,
    _val: createArrayProxy(_state, initVal),
  };
};

const methodToActionMapping = ({ dom, args, depsValues, renderDomItem }) => ({
  assign: () => dom.replaceChildren(...args.map(renderDomItem)),
  set: () => {
    const child = dom.children[args[0]];
    if (child) {
      child.replaceWith(renderDomItem(args[1]));
    }
  },
  push: () => args[0].map((v) => dom.appendChild(renderDomItem(v))),
  pop: () => dom.lastChild && dom.removeChild(dom.lastChild),
  shift: () => dom.firstChild && dom.removeChild(dom.firstChild),
  unshift: () => {
    const item = renderDomItem(args[0], depsValues);
    dom.firstChild ? dom.firstChild.before(item) : dom.appendChild(item);
  },
  splice: () => {
    const [start, deleteCount, ...newItems] = args;
    for (
      let i = Math.min(start + deleteCount - 1, dom.children.length - 1);
      i >= start;
      i--
    ) {
      dom.children[i].remove();
    }
    if (newItems) {
      for (let i = start - 1; i < newItems.length; i++) {
        const domItem = renderDomItem(newItems[i + 1 - start]);
        dom.children[i]
          ? dom.children[i].after(domItem)
          : dom.appendChild(domItem);
      }
    }
  },
});

let updateDomsArray = () => {
  let changedStatesArray = [...changedStatesVector];
  changedStatesVector = undefined;
  for (let change of changedStatesArray) {
    for (let binding of new Set(
      change.bindings.filter((b) => b.dom?.isConnected)
    )) {
      let { _deps, dom, func, renderItem } = binding;
      const depsValues = _deps.map((d) => d._val);
      if (func) {
        let newDom = binding.func(
          ...depsValues,
          dom,
          ..._deps.map((d) => d.oldVal)
        );
        if (newDom !== dom) {
          if (newDom != undefined) {
            dom.replaceWith((binding.dom = toDom(newDom)));
          } else {
            dom.remove();
            binding.dom = undefined;
          }
        }
      } else if (renderItem) {
        for (let { method, args } of change.arrayOps) {
          methodToActionMapping({
            dom,
            args,
            depsValues,
            renderDomItem: (value) =>
              toDom(renderItem({ value, deps: depsValues })),
          })[method]?.call();
        }
      }
    }
  }
  for (let s of changedStatesArray) {
    s.oldVal = s._val;
    s.arrayOps = [];
  }
};

let bindArray = ({ deps, renderContainer, renderItem }) => {
  let result = renderContainer({ values: deps.map((d) => d._val), renderItem });
  if (result == undefined) return [];
  let binding = {
    _deps: deps,
    dom: toDom(result),
    renderContainer,
    renderItem,
  };
  for (let dep of deps) {
    dep.bindings.push(binding);
  }
  return binding.dom;
};

export default { stateArray, bindArray };
