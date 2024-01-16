import React from "./core/React.js";

function Counter({num}) {
  return <div>{num}</div>
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
    <Counter num={100}></Counter>
  </div>
  )
}

export default App;
