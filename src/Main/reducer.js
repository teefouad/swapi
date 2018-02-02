import * as types from './types';

export const initialState = {
  /**
   * Indicates whether the data is being loaded or not.
   */
  loading: false,

  /**
   * Total people count. This value will be returned from the API.
   */
  totalCount: 0,

  /**
   * An hash table of people objects, each object holds information about each person.
   * The keys will be the id of each person.
   */
  people: {},

  /**
   * When a person is first loaded, their planet name is not resolved until it is clicked.
   * Once it is clicked, a request will be made to fetch the planet name and the response
   * will be cached here so that it would not be necessary to fetch the same planet data
   * again if another person from the same planet was clicked later.
   */
  planetsCache: {},

  /**
   * A flag that indicates whether there is still more people data to be fetched.
   */
  shouldLoadNextPage: false,

  /**
   * Refers to the ID of the person whose data is currently being fetched, if any.
   */
  loadingPersonalInfo: null,

  /**
   * An object that refers to the selected person. If no one is selected, this value should
   * be null.
   */
  activePerson: null,
};

/**
 * A small helper function that accepts a swapi URL and extracts the ID.
 * For example: getIdFromURL('https://swapi.co/api/people/12/); // 12
 * @param {String} url  The URL to extract an ID from.
 * @returns {String}    The ID returned as a string.
 */
const getIdFromURL = url => (url.match(/^http.+\/(.*?)\/$/) || [])[1];

/**
 * Reducer function. You know the drill.
 */
export default (state = initialState, action = {}) => {
  switch (action.type) {
    case types.GET_PEOPLE:
      return {
        ...state,
        loading: true,
        shouldLoadNextPage: false,
      };

    case `${types.GET_PEOPLE}_SUCCESS`: {
      /**
       * An array of newly loaded people. Map over each person object to add the planetID
       * then reduce the array to a hash table.
       */
      const newPeople = action.payload.data.results.map(person => ({
        ...person,
        planetID: getIdFromURL(person.homeworld),
        id: getIdFromURL(person.url),
      })).reduce((prev, next) => ({
        ...prev,
        [next.id]: next,
      }), {});

      /**
       * Create a new hash table by merging existing data with newly loaded people data.
       */
      const people = {
        ...state.people,
        ...newPeople,
      };

      return {
        ...state,
        loading: false,
        totalCount: action.payload.data.count,
        shouldLoadNextPage: Object.keys(people).length < action.payload.data.count,
        people,
      };
    }

    case types.OPEN_PERSONAL_INFO:
      return {
        ...state,
        loadingPersonalInfo: action.payload.person.id,
      };

    case `${types.OPEN_PERSONAL_INFO}_SUCCESS`: {
      const { planet } = action.payload.data;

      /**
       * Resolve residents to display IDs instead of URLs.
       */
      const residents = planet.residents.map(resident => getIdFromURL(resident) || resident);

      /**
       * Now we can create the activePerson object.
       */
      const activePerson = {
        ...action.payload.data.person,
        planet: {
          ...planet,
          residents,
        },
      };

      return {
        ...state,
        loadingPersonalInfo: null,
        activePerson,
        planetsCache: {
          ...state.planetsCache,
          [activePerson.planetID]: activePerson.planet,
        },
      };
    }

    case types.CLOSE_PERSONAL_INFO:
      return {
        ...state,
        activePerson: null,
        loadingPersonalInfo: null,
      };

    default:
      return state;
  }
};
