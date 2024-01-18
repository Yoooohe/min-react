import React from "./core/React.js";

let showBar = false;
function Counter() {
  // const foo = <div>foo</div>
  // function Foo() {
  //   return (
  //     <div>
  //       foo
  //       <div>child</div>
  //     </div>
  //   )

  const foo = (
    <div>
      foo
      <div>child</div>
    </div>
  )

  // const bar = <p>bar</p>
  const bar = <div>bar</div>



  function toggleBar() {
    showBar = !showBar;
    React.update();
  }

  return (
    <div>
      Counter
      {/* <div>{showBar ? bar : <Foo/>}</div> */}
      {/* <div>{showBar ? bar : foo}</div> */}
      {showBar && bar}

      <button onClick={toggleBar}>show Bar</button>
    </div>
  )
}

function App() {
  return (
    <div>
      mini-react
      <Counter></Counter>
    </div>
  )
}

export default App;