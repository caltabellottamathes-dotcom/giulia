// Giulia push service worker — handles incoming push + notification clicks.
self.addEventListener("push", (event) => {
  let data = {
    title: "Giulia",
    body: "",
    url: "/",
    icon: "https://media.base44.com/images/public/6a6cc0011ab9e3b32cfc1057/a408b643e_Gemini_Generated_Image_2gi5oq2gi5oq2gi51.png",
  };
  try {
    data = { ...data, ...JSON.parse(event.data ? event.data.text() : "{}") };
  } catch {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
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
