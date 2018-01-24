/**
 * index.js
 */
import React from 'react';
import { render } from 'react-dom';

if (module.hot) {
  module.hot.accept();
}

// render the app
render(<div>Hello React!</div>, document.getElementById('app'));
