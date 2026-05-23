self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const options = {
        body: payload.body || 'New update from EGL eSports!',
        icon: '/assets/egl-logo-CWlMsNld.jpeg',
        badge: '/assets/egl-logo-CWlMsNld.jpeg',
        vibrate: [100, 50, 100],
        data: {
          url: payload.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(payload.title || 'EGL eSports', options)
      );
    } catch (e) {
      // Fallback if data is not JSON
      const text = event.data.text();
      const options = {
        body: text,
        vibrate: [100, 50, 100]
      };
      event.waitUntil(
        self.registration.showNotification('EGL eSports', options)
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Open the page
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
