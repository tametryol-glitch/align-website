self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Align';
  const options = {
    body: data.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: { url: data.url || '/', notificationId: data.notification_id || null },
    tag: data.tag || 'default',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  // Reuse an Align tab if one is already open instead of stacking up a new
  // window on every click — clients.openWindow() alone leaves people with a
  // pile of duplicate tabs.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            return client.navigate(url).then((c) => (c ? c.focus() : client.focus()));
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
