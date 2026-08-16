router
  .route("/notifications/broadcast")
  .post(broadcastNotification);
```

Final endpoint: `POST /api/v1/admin/notifications/broadcast`
(also reachable at the legacy `/api/admin/notifications/broadcast` since
`app.js` mounts `adminRoutesV1` at both prefixes).

Request body:
```json
{
  "title": "Platform maintenance tonight",
  "message": "We'll be down for 10 minutes at 11pm UTC.",
  "category": "SYSTEM",
  "link": "/announcements/123",
  "roles": ["user", "instructor"]
}
```
`roles` is optional — omit it (or pass `[]`) to broadcast to every user.
