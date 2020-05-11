import React from 'react';

export default ({ updateText }) => {
  return (
    <input onChange={updateText} placeholder="cache_id here!"></input>
  )
}