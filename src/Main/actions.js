import * as types from './types';

export const getPeople = page => ({
  type: types.GET_PEOPLE,
  payload: {
    page,
  },
});

export const getPlanet = planet => ({
  type: types.GET_PLANET,
  payload: {
    planet,
  },
});

export const sortPeople = dir => ({
  type: types.SORT_PEOPLE,
  payload: {
    dir,
  },
});

export const filterPeople = query => ({
  type: types.FILTER_PEOPLE,
  payload: {
    query,
  },
});

export const openPersonalInfo = person => ({
  type: types.OPEN_PERSONAL_INFO,
  payload: {
    person,
  },
});

export const openPersonalInfoFromCache = (person, planet) => ({
  type: `${types.OPEN_PERSONAL_INFO}_SUCCESS`,
  payload: {
    data: {
      planet,
      person,
    },
  },
});

export const closePersonalInfo = () => ({
  type: types.CLOSE_PERSONAL_INFO,
});
