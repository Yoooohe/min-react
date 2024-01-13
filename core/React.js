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
  const { type, props } = el
  const dom = type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
  Object.keys(props).forEach(key => {
    if (key === 'children') {
      props[key].forEach(child => render(child, dom));
    } else {
      dom[key] = props[key]
    }
  })
  container.append(dom);
}

const React = {
  render,
  createElement,
}

export default React;