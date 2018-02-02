import request from 'browser-request';

const apiRequest = url => (new Promise((resolve, reject) => {
  request(`${process.env.SW_API_BASE_URL}${url}`, (err, response) => {
    if (err) {
      reject(err);
    } else {
      resolve(JSON.parse(response.body));
    }
  });
}));

const Api = {
  getPeople(page) {
    return apiRequest(`people?page=${page || 1}`);
  },

  getPlanet(planet) {
    return apiRequest(`planets/${planet}`);
  },
};

export default Api;
