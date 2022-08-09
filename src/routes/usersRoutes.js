const express = require('express');
const UsersController = require('../controllers/UsersController');
const router = express.Router();

router.post('/signup', UsersController.signup);//signup cadastro do usuairo
router.post('/signin', UsersController.signin);//signin (login) do usuario
router.get('/ranking', UsersController.ranking);// retorna lista com ranking
//router.get('/list/:id', UsersController.getId);
//router.delete('/delete/:id', UsersController.deleteId);
router.put('/list/:id', UsersController.updateId);
router.put('/user/:nick/score/:score', UsersController.score)//

module.exports = router;