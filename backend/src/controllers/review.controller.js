```js
const notificationService = require("../services/notification.service");
// ...
await notificationService.createNotification({
  userId: updatedReview.userId,
  title: "Instructor replied to your review",
  message: `${req.user.name} responded to your review on "${updatedReview.course.title}".`,
  category: "MESSAGE",
  link: `/courses/${updatedReview.courseId}`,
});
```