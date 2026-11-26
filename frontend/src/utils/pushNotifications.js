import api from '../services/api';

// Helper to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return;
  }

  // Request browser Notification permission if not already allowed
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted.');
      return;
    }
  } else if (Notification.permission !== 'granted') {
    console.warn('Notification permission is blocked or denied.');
    return;
  }

  try {
    // 1. Get the active service worker registration
    const registration = await navigator.serviceWorker.ready;

    // 2. Fetch the VAPID Public Key from backend
    const vapidKeyRes = await api.get('/push/vapid-public-key');
    const vapidPublicKey = vapidKeyRes.data.publicKey;

    if (!vapidPublicKey) {
      throw new Error('VAPID public key not found on backend');
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // 3. Subscribe user on the push service
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // 4. Send subscription details to Spring Boot backend
    const subJson = subscription.toJSON();
    const payload = {
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth
    };

    await api.post('/push/subscribe', payload);
    console.log('Successfully registered Web Push notifications with Nexus backend.');

  } catch (error) {
    console.error('Failed to subscribe user to Web Push:', error);
  }
}
