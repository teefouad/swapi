import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { getRootReducer } from './connectToStore';

// enable Redux devTools
const enhancers = compose(window.devToolsExtension ? window.devToolsExtension() : foo => foo);

// create the saga middleware
export const sagaMiddleware = createSagaMiddleware({
  logger: (level, ...args) => {
    if (level === 'error') {
      console.log(`Error: ${args.join(' ')}`);
    }
  },
});

// create the store
const store = createStore(
  getRootReducer(),
  compose(
    applyMiddleware(sagaMiddleware),
    enhancers,
  ),
);

export default store;
