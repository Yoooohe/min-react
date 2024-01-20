const createTextNode = (stringVal) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: stringVal,
      children: [],
    }
  }
}

// 展开符号支持传多个children并将其转化成数组
const createElement = (type, props, ...children) => {
  return ({
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'string'  || typeof child === 'number'? createTextNode(child) : child)
    }
  })
}

// 2. 抽象渲染方法
const render = (el, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextUnitOfWork = wipRoot;
}

const update = () => {
  let currentFiber = wipFiber;
  return () => {
    console.log(currentFiber)
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextUnitOfWork = wipRoot;
  }
}

const createDom = (type) => {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

const updateProps = (dom, nextProps, prevProps) => {
  // Object.keys(nextProps).forEach(key => {
  //   if (key !== 'children') {
  //     if (key.startsWith('on')) {
  //       const eventType = key.slice(2)?.toLowerCase();
  //       dom.addEventListener(eventType, nextProps[key]);
  //     }
  //     else {
  //       dom[key] = nextProps[key];
  //     }
  //   }
  // })
  
  // 1. old有，新的没有，删除
  Object.keys(prevProps).forEach(key => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  })

  // 2. old没有，新的有，新增
  // 3. old有，新的有，修改
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith('on')) {
          const eventType = key.slice(2)?.toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        }
        else {
          dom[key] = nextProps[key];
        }
      }
    }
  })
}

const reconcileChildren = (fiber, children) => {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((item, index) => {
    const isSameType = oldFiber && oldFiber.type === item.type;
    let newFiber;
    if (isSameType) {
      // update
      newFiber = {
        type: item.type,
        props: item.props,
        parent: fiber,
        sibling: null,
        child: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    } else {
      // create
      if (item) {
        newFiber = {
          type: item.type,
          props: item.props,
          parent: fiber,
          sibling: null,
          child: null,
          dom: null,
          effectTag: 'PLACEMENT',
        }
      }
     
      if (oldFiber) {
        deletions.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber;
    }
    if (newFiber) {
      prevChild = newFiber;
    }
  })

  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

// work in progress root
let wipRoot = null;
let currentRoot = null;
let deletions = [];
let wipFiber = null;

const commitRoot = () => {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHooks();
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitEffectHooks() {
  function run(fiber) {
    if(!fiber) return;
    if (!fiber.alternate) {
      // 初始化时alternate没有值
      fiber?.effectHooks?.forEach((hook) => {
        hook.cleanup = hook?.callback();
      })
    } else {
      // update 检测deps是否发生改变
      fiber?.effectHooks?.forEach((newHook, index) => {
        const oldEffectHook = fiber.alternate?.effectHooks?.[index];
        const needUpdate = oldEffectHook?.deps?.some((dep, i) => {
          return dep !== newHook?.deps?.[i]
        })
        needUpdate && (newHook.cleanup = newHook?.callback());
      })
     
    }
    run(fiber.child);
    run(fiber.sibling);
  }

  function runCleanup(fiber) {
    if (!fiber) return;
    fiber.alternate?.effectHooks?.forEach((hook) => {
      if (hook?.deps?.length > 0) {
        hook?.cleanup?.();
      }
    })
    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(wipRoot)
  run(wipRoot)
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while(!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child)
  }
}


const commitWork = (fiber) => {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if(fiber.effectTag === 'UPDATE') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === 'PLACEMENT') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const updateFunctionComponent = (fiber) => {
  stateHooks = [];
  stateHookIndex = 0;
  effectHooks = [];
  wipFiber = fiber;
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children)
}

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, {});
  }
  const children = fiber.props.children;
  reconcileChildren(fiber, children)
}

const performUnitOfWork = (fiber) => {
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber)
  }
  // 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return fiber.parent.sibling
}

let nextUnitOfWork  = null;
const workLoop = (deadline) => {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {    
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

    if (wipRoot?.sibling?.type === nextUnitOfWork?.type) {
      nextUnitOfWork = undefined;
    }

    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

let stateHooks;
let stateHookIndex;
function useState(initial) {
  let currentFiber = wipFiber;

  const oldHook = currentFiber?.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  }

  // 在useState被再次调用时，统一更新收集操作
  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state)
  })
  stateHook.queue = [];

  stateHookIndex++;
  stateHooks.push(stateHook)
  currentFiber.stateHooks = stateHooks;

  function setState(action) {
    const eagerState = typeof action === 'function' ? action(stateHook.state) : action;
    if (eagerState === stateHook.state) return;

    stateHook.queue.push(typeof action === 'function' ? action : () => action);
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }
    nextUnitOfWork = wipRoot;
  }

  return [stateHook.state, setState]
}

let effectHooks;
function useEffect(callback, deps){
  const effectHook = {
    callback,
    deps,
  }
  effectHooks.push(effectHook)
  wipFiber.effectHooks = effectHooks;
}

requestIdleCallback(workLoop)

const React = {
  render,
  update,
  useState,
  useEffect,
  createElement,
}

export default React;