const webpush = require("web-push");

// Configure vapid keys from .env
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@smartdorm.com";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidEmail, publicVapidKey, privateVapidKey);
} else {
  console.warn("VAPID keys not set for push notifications.");
}

/**
 * Send push notification to a user's subscriptions
 * @param {Array} subscriptions Array of push subscriptions for a user
 * @param {Object} payload { title, body, icon, url, data }
 */
const sendPushNotification = async (subscriptions, payload) => {
  if (!subscriptions || subscriptions.length === 0) return;

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body || payload.message,
    icon: payload.icon || "/favicon.ico",
    data: {
      url: payload.url || payload.link || "/",
      ...payload.metadata
    }
  });

  const pushPromises = subscriptions.map((sub) =>
    webpush.sendNotification(sub, pushPayload).catch((error) => {
      console.error("Push notify error:", error.statusCode);
      // If subscription expired or invalid (404/410), we skip/remove it later?
      return null;
    })
  );

  await Promise.all(pushPromises);
};

module.exports = {
  sendPushNotification
};
