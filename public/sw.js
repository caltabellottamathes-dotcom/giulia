// Giulia push service worker — handles incoming push + notification clicks.
self.addEventListener("push", (event) => {
  let data = { title: "Giulia", body: "", url: "/" };
  try {
    data = { ...data, ...JSON.parse(event.data ? event.data.text() : "{}") };
  } catch {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url || "/" },
      tag: "giulia-push",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if (client.url.indexOf(self.location.origin) === 0) {
          client.focus();
          client.postMessage({ type: "navigate", url: target });
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
