import React from 'react';

export default ({ satchel, getGeodes }) => {
  return (
    <>
      <label htmlFor="getGeodes">get geodes!</label>
      <button id="getGeodes" onMouseUp={getGeodes}></button>
      <ol>
        {satchel.map(geode => <li>{`"${geode.bio}" - ${geode.creator}`}</li>)}
      </ol>
    </>
  )
}