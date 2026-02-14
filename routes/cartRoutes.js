/**
 * Rutas de carrito. Todas requieren autenticación y afectan solo al usuario logueado.
 */

const express = require('express');
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addItem);
router.put('/:cartItemId', verifyToken, cartController.updateQuantity);
router.delete('/:productId', verifyToken, cartController.removeItem);
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
