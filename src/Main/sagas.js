import createSaga from '../createSaga';
import * as types from './types';
import Api from '../Api';

export const getPeopleSaga = createSaga({
  sagaAction: types.GET_PEOPLE,
  callback: action => Api.getPeople(action.payload.page),
});

export const getPlanetSaga = createSaga({
  sagaAction: types.OPEN_PERSONAL_INFO,
  callback: action => (new Promise((resolve, reject) => {
    Api.getPlanet(action.payload.person.planetID)
      .then(data => resolve({
        planet: data,
        person: action.payload.person,
      }))
      .catch(err => reject(err));
  })),
});
