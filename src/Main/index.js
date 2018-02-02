import React, { Component } from 'react';
import PropTypes from 'prop-types';

import connect from '../connectToStore';
import reducer from './reducer';
import * as actions from './actions';
import * as sagas from './sagas';
import styles from './styles.scss';

class MainPage extends Component {
  static propTypes = {
    starwars: PropTypes.objectOf(PropTypes.any),
    actions: PropTypes.objectOf(PropTypes.object),
  }

  static defaultProps = {
    starwars: {},
    actions: {},
  }

  state = {
    /**
     * Percentage of loaded data so far. This will be displayed to the user while
     * fetching data from the API.
     */
    percentage: 0,

    /**
     * Holds the current search query.
     */
    query: '',

    /**
     * Represents the currently displayed page. When people are filtered using the search
     * input field, the pagination will be updated and this value will be reset to 0.
     */
    page: 0,

    /**
     * Sort direction. Defines how the list of people would be sorted. Possible values
     * are 'asc', 'desc' and 'none'. Value 'none' means no sorting, the data will be
     * displayed as received from the API.
     */
    sortDir: 'none',
  }

  componentDidMount() {
    /**
     * This is a reference to the index of the people page to be loaded next.
     */
    this.pageToLoad = 1;

    /**
     * Dispatches an action to load the first people page. The component will continue
     * loading inside componentWillReceiveProps, if there is more data to be loaded.
     */
    this.props.actions.starwars.getPeople(this.pageToLoad);
  }

  componentWillReceiveProps(nextProps) {
    /**
     * Checks whether there are more people data to be fetched.
     */
    if (nextProps.starwars.shouldLoadNextPage) {
      /**
       * Updates the percentage value based on the number of loaded people vs the total
       * count of people. The total count of people is an integer returned by the API.
       */
      const loaded = Object.keys(nextProps.starwars.people).length;
      const total = nextProps.starwars.totalCount;
      const percentage = Math.round((100 * loaded) / total);

      this.setState({ percentage });

      /**
       * Since there is still more data to be fetched, load the next page.
       */
      this.pageToLoad += 1;
      this.props.actions.starwars.getPeople(this.pageToLoad);
    }
  }

  /**
   * Toggles personal information for a specific character.
   * @param {Object} person Person object.
   */
  togglePersonalInfo = (person) => {
    const { planetsCache, activePerson } = this.props.starwars;

    if (activePerson && person.id === activePerson.id) {
      /**
       * If the person is already being viewed, close its personal info.
       */
      this.props.actions.starwars.closePersonalInfo();
    } else
    if (planetsCache[person.planetID]) {
      /**
       * If the planet data has already been loaded and cached, use it from the cache
       * instead of re-loading it.
       */
      this.props.actions.starwars.openPersonalInfoFromCache(person, planetsCache[person.planetID]);
    } else {
      /**
       * Otherwise, load planet data and display personal info.
       */
      this.props.actions.starwars.openPersonalInfo(person);
    }
  }

  /**
   * Updates search query and resets pagination. This is an event listener that is attached
   * to the filter input field.
   */
  filterPeople = (e) => {
    this.setState({
      query: e.target.value,
      page: 0,
    });
  }

  /**
   * Cycles through the three sorting directions by one step each time it is called.
   */
  toggleSort = () => {
    const sortValues = ['none', 'asc', 'desc'];
    const index = sortValues.indexOf(this.state.sortDir);
    const newIndex = index === sortValues.length - 1 ? 0 : index + 1;

    this.setState({ sortDir: sortValues[newIndex] });
  }

  /**
   * Displays a specific page. This method is used mainly for pagination.
   */
  showPage = (page) => {
    this.setState({ page });
  }

  render() {
    const {
      loading,
      people,
      activePerson,
      loadingPersonalInfo,
    } = this.props.starwars;

    /**
     * How many people to display on a single page.
     */
    const showPerPage = 10;

    /**
     * Convert `people` object to an array.
     */
    const peopleList = Object.values(people);

    /**
     * Filter the array of people based on the currently stored query.
     */
    const filteredPeopleList = peopleList.filter((person) => {
      const query = this.state.query.toLowerCase();

      return (
        person.name.toLowerCase().indexOf(query) !== -1
      );
    });

    /**
     * Then sort the filtered array of people based on the currently selected order.
     */
    const sortedPeopleList = filteredPeopleList.sort((a, b) => {
      if (this.state.sortDir === 'none') return undefined;

      const dir = this.state.sortDir === 'asc' ? -1 : 1;
      return (a.name > b.name ? -1 : 1) * dir;
    });

    /**
     * Finally, grab a portion of the sorted array to display based on the currently selected page.
     */
    const peopleToDisplay = sortedPeopleList.slice(
      this.state.page * showPerPage,
      (this.state.page * showPerPage) + showPerPage,
    );

    /**
     * Determine how many pages to display on the pagination nav.
     */
    const pagesCount = Math.ceil(filteredPeopleList.length / showPerPage);

    return (
      <div>
        <h1 className="app-title">
          StarWars
        </h1>

        <h2 className="app-subtitle">
          May the 4th be with you
        </h2>

        <div className="app-tools">
          <input
            type="text"
            value={this.state.query}
            className={styles.filterInput}
            placeholder="Search..."
            onChange={this.filterPeople}
          />

          <button
            onClick={this.toggleSort}
            className={`${styles.sortBtn} ${this.state.sortDir}`}
          >
            Sort
          </button>
        </div>

        {
          (() => {
            /**
             * Loading
             */
            if (loading) {
              return (
                <div className={styles.preloader}>
                  {this.state.percentage}%
                </div>
              );
            }

            /**
             * No results
             */
            if (Object.keys(peopleToDisplay).length === 0) {
              return (
                <div className={styles.noResults}>
                  Whoops, nothing to display
                </div>
              );
            }

            /**
             * Display results
             */
            return (
              <ul className={`${styles.people} ${activePerson ? 'has-active' : ''} ${loadingPersonalInfo ? 'has-loading' : ''}`}>
                {
                  peopleToDisplay.map((person, index) => {
                    const personWrapperClasses = [styles.personWrapper];

                    if (activePerson && activePerson.id === person.id) {
                      personWrapperClasses.push('is-active');
                    }

                    if (loadingPersonalInfo === person.id) {
                      personWrapperClasses.push('is-loading');
                    }

                    return (
                      <li
                        key={person.id}
                        className={personWrapperClasses.join(' ')}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <div
                          className={`${styles.person} color-${person.skin_color}`}
                          onClick={() => this.togglePersonalInfo(person)}
                          onKeyUp={e => e.keyCode === 13 && this.togglePersonalInfo(person)}
                          tabIndex={0}
                          role="button"
                        >
                          <div className={styles.personName}>
                            {person.name}
                          </div>

                          {
                            activePerson && (
                              <ul>
                                <li>
                                  <div className={styles.personFeatureName}>
                                    Hair Color
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.hair_color}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    Eye Color
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.eye_color}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    Skin Color
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.skin_color}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    Birth Year
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.birth_year}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    Gender
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.gender}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    Home Planet
                                  </div>

                                  <div className={styles.personFeature}>
                                    {activePerson.planet.name}
                                  </div>
                                </li>

                                <li>
                                  <div className={styles.personFeatureName}>
                                    From the same Planet
                                  </div>

                                  <div className={styles.personFeature}>
                                    {
                                      activePerson.planet.residents
                                        .slice(0, 7)
                                        .filter(residentID => residentID !== activePerson.id)
                                        .map(residentID => (
                                          people[residentID] && (
                                            <div key={residentID}>{people[residentID].name}</div>
                                          )
                                        ))
                                    }
                                  </div>
                                </li>
                              </ul>
                            )
                          }
                        </div>
                      </li>
                    );
                  })
                }
              </ul>
            );
          })()
        }

        {
          !Number.isNaN(pagesCount) && pagesCount > 0 && !loading && (
            <ul className={styles.pagination}>
              {
                (() => {
                  const pagination = [];

                  for (let i = 0; i < pagesCount; i += 1) {
                    pagination.push((
                      <li key={i}>
                        <button
                          className={i === this.state.page ? 'is-active' : ''}
                          onClick={() => this.showPage(i)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ));
                  }

                  return pagination;
                })()
              }
            </ul>
          )
        }
      </div>
    );
  }
}

export default connect(MainPage, {
  reducer, actions, sagas, stateKey: 'starwars', actionsKey: 'starwars',
});
