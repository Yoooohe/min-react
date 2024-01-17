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
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextUnitOfWork = wipRoot;
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
      oldFiber = oldFiber.sibling;
    }
    
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  })
}

// work in progress root
let wipRoot = null;
let currentRoot = null;

const commitRoot = () => {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
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
  if (!shouldYield && nextUnitOfWork) {
    shouldYield = deadline.timeRemaining() < 1;
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop)

const React = {
  render,
  update,
  createElement,
}

export default React;