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
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
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

const initChildren = (fiber) => {
  const children = fiber.props.children;
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
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

const performUnitOfWork = (fiber) => {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    fiber.parent.dom.append(dom);
    updateProps(dom, fiber.props);
  }
  initChildren(fiber)
  if (fiber.child) {
    return fiber.child
  }
  if (fiber.sibling) {
    return fiber.sibling
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
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement,
}

export default React;