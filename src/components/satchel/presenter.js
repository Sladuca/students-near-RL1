import React from 'react';

export default ({ satchel, getGeodes, updateText, mintNew }) => {
  return (
    <>
      <input onChange={updateText} placeholder="new geode bio here!"></input>
      <button onMouseUp={mintNew}/>
      <label htmlFor="getGeodes">get geodes!</label>
      <button id="getGeodes" onMouseUp={getGeodes}></button>
      <ol>
        {satchel.map((geode, i) => <li key={i}>{`"${geode.bio}" - ${geode.creator}`}</li>)}
      </ol>
    </>
  )
}