import React from "./core/React.js";


function Foo() {

  const [count, setCount] = React.useState(10);
  const [bar, setBar] = React.useState('bar');
  function handleClick() {
    setCount(c => c+1)
    // setBar(c => c+'bar')
    setBar('bar')
  }

  return (
    <div>
      <div>{count}</div>
      <div>{bar}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}


function App() {
  return (
    <div>
      hi-mini-react count
      <Foo></Foo>
    </div>
  )
}

export default App