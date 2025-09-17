const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, admin, getUsers);
router.get('/stats', auth, admin, getUserStats);
router.get('/:id', auth, admin, getUser);
router.put('/:id', auth, admin, updateUser);
router.delete('/:id', auth, admin, deleteUser);

module.exports = router;
