const express = require('express');
const router = express.Router();
const interventionController = require('../controllers/interventionController');

router.get('/', interventionController.homepage);
router.get('/about', interventionController.about);
router.get('/add', interventionController.addIntervention);
router.post('/add', interventionController.postIntervention);
router.get('/view/:id', interventionController.view);
router.get('/edit/:id', interventionController.edit);
router.put('/edit/:id', interventionController.editPost);
router.delete('/edit/:id', interventionController.deleteIntervention);
router.post('/search', interventionController.searchInterventions);
router.get('/export/:id', interventionController.exportPDF);

module.exports = router;
