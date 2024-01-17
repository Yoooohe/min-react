import React from "./core/React.js";

let count = 0; // 全局变量
function Counter({num}) {

  function handleClick() {
    count ++;
    console.log(count);
    React.update();
  }

  return (
    <div>
      count: {count}
      <button onClick={handleClick}>click</button>
    </div>
  )
}

// function CounterContainer() {
//   return <Counter></Counter>
// }

// const App = (
//   <div>
//     Hello World
//     <CounterContainer></CounterContainer>
//   </div>)

function App() {
  return (
  <div>
    Hello World
    <Counter num={101}></Counter>
    {/* <Counter num={100}></Counter> */}
  </div>
  )
}

export default App;
