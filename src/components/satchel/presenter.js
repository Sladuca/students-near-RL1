import React from 'react';

export default ({ satchel, getGeodes, updateText, mintNew }) => {
  return (
    <>
      <input onChange={updateText} onKeyUp={mintNew} placeholder="new geode bio here!"></input>
      <label htmlFor="getGeodes">get geodes!</label>
      <button id="getGeodes" onMouseUp={getGeodes}></button>
      <ol>
        {satchel.map(geode => <li>{`"${geode.bio}" - ${geode.creator}`}</li>)}
      </ol>
    </>
  )
}