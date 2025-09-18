const express = require('express');

const { create, get, getByCode, update, remove, search } = require('../controllers/courseController');

const router = express.Router();

router.post('/', create);
router.get('/', get);
router.get('/search', search);
router.get('/:code', getByCode);
router.put('/:code', update);
router.delete('/:code', remove);

module.exports = router;