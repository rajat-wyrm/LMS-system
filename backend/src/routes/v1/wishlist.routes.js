const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/db');
const { protect } = require('../../middlewares/auth.middleware');

// GET: Fetch all wishlisted courses for the logged-in user
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wishlistedCourses: true } // This automatically fetches the course details
    });
    res.json({ success: true, data: user.wishlistedCourses });
  } catch (error) {
    next(error);
  }
});

// POST: Add a specific course to the user's wishlist
router.post('/', protect, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { wishlistedCourses: { connect: { id: courseId } } }
    });
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove a specific course from the user's wishlist
router.delete('/:courseId', protect, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { wishlistedCourses: { disconnect: { id: req.params.courseId } } }
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
