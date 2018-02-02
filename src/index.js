/**
 * index.js
 */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store, { sagaMiddleware } from './store';
import { getRootReducer, getSagas } from './connectToStore';
import Main from './Main';

if (module.hot) {
  module.hot.accept();
}

const App = (
  <Provider store={store}>
    <Main />
  </Provider>
);

// reducers are registered by now, so update the root reducer
store.replaceReducer(getRootReducer());

// then run the sagas
const sagas = getSagas();
Object.values(sagas).forEach(saga => sagaMiddleware.run(saga));

// render the app
render(App, document.getElementById('app'));
