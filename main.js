// v1 生成Hello World基础js代码
// const rootDom = document.getElementById('root');
// const appDom = document.createElement('div');
// appDom.id = 'app';
// rootDom.appendChild(appDom);
// const textNode = document.createTextNode('Hello World');
// appDom.append(textNode);

// v2
// 1. 抽象虚拟dom对象
// const vDom = {
//   type: 'div',
//   props: {
//     id: 'app',
//     children: [{
//       type: 'TEXT_ELEMENT',
//       props: {
//         nodeValue: 'Hello World',
//         children: [],
//       }
//     }],
//   }
// }

// const createTextNode = (stringVal) => {
//   return {
//     type: 'TEXT_ELEMENT',
//     props: {
//       nodeValue: stringVal,
//       children: [],
//     }
//   }
// }

// // 展开符号支持传多个children并将其转化成数组
// const createElemnt = (type, props, ...children) => {
//   return ({
//     type,
//     props: {
//       ...props,
//       children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
//     }
//   })
// }

// 2. 抽象渲染方法
// const render = (el, container) => {
//   const { type, props } = el
//   const dom = type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
//   Object.keys(props).forEach(key => {
//     if (key === 'children') {
//       props[key].forEach(child => render(child, dom));
//     } else {
//       dom[key] = props[key]
//     }
//   })
//   container.append(dom);
// }

// const rootDom = document.getElementById('root');
// render(createElemnt('div', {id: 'app'}, 'Hello World'), rootDom)

import ReactDom from  './core/ReactDom.js';
import React from './core/React.js';

const App = React.createElement('div', {id: 'app'}, 'Hello World');

ReactDom.createRoot(document.getElementById('root')).render(App)

