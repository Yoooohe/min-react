import ReactDom from  './core/ReactDom.js';
import React from './core/React.js';

const App = React.createElement('div', {id: 'app'}, 'Hello World');

ReactDom.createRoot(document.getElementById('root')).render(App)