import React from 'react';

export default ({ updateText, getCache }) => {
  return (
    <div>
      <input onChange={updateText} placeholder="cache_id here!"></input>
      <button onChange={getCache}>submit</button>
      <button>trade with cache</button>
      <button>add to cache</button>
      {/* <button onChange={updateLog}>sign cache</button> */}
    </div>
    )
}