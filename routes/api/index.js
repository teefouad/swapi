import express from 'express';
import request from 'request';

const api = url => (new Promise((resolve, reject) => {
  console.log(`${process.env.SW_API_BASE_URL}${url}`);
  request(`${process.env.SW_API_BASE_URL}${url}`, (err, response) => {
    if (err) {
      reject(err);
    } else {
      resolve(JSON.parse(response.body));
    }
  });
}));

const router = express.Router();

/* GET people */
router.get('/people', (req, res) => {
  api('people')
    .then(data => res.json(data))
    .catch((e) => {
      res.end(e);
    });
});

/* GET person */
router.get('/people/:id', (req, res) => {
  api(`people/${req.params.id}`)
    .then(data => res.json(data))
    .catch((e) => {
      res.end(e);
    });
});

/* GET from planet */
router.get('/people/from/:planet', () => {

});

/* GET search */
router.get('/people/search/:query', () => {

});

export default router;
