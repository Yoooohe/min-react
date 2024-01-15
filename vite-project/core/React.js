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
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextUnitOfWork;
}

const createDom = (type) => {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

const updateProps = (dom, props) => {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  })
}

const initChildren = (fiber, children) => {
  let prevChild = null;
  children.forEach((item, index) => {
    const newFiber = {
      type: item.type,
      props: item.props,
      parent: fiber,
      sibling: null,
      child: null,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  })
}

let root = null;
const commitRoot = () => {
  commitWork(root.child);
  root = null;
}

const commitWork = (fiber) => {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }
  commitWork(fiber.sibling);
  commitWork(fiber.child);
}

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)];
  initChildren(fiber, children)
}

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props);
  }
  const children = fiber.props.children;
  initChildren(fiber, children)
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
  if (!nextUnitOfWork && root) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement,
}

export default React;