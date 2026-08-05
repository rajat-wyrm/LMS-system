const express = require('express');
const { updateProfile, updatePassword, updateAvatar } = require('../../controllers/profile.controller');
const { protect } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate');
const { updatePasswordSchema } = require('../../validations/profile.validation');

const router = express.Router();

router.use(protect);

router.put('/', updateProfile);
router.put('/password', validate(updatePasswordSchema), updatePassword);
router.put('/avatar', upload.single('avatar'), updateAvatar);

module.exports = router;
