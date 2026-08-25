const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if (!('serviceWorker' in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const worker = registration.installing;
        if (!worker) return;

        worker.onstatechange = () => {
          if (worker.state !== 'installed') return;

          if (navigator.serviceWorker.controller) {
            // Nova versão disponível
            if (config && config.onUpdate) config.onUpdate(registration);
          } else {
            // Conteúdo guardado em cache para uso offline
            if (config && config.onSuccess) config.onSuccess(registration);
          }
        };
      };

      // O browser só verifica sozinho o service-worker.js em cada
      // navegação — quem deixa a app aberta (ou instalada, sem fechar)
      // podia nunca chegar a ver o aviso de atualização. Isto força a
      // verificação sempre que a aba volta a ficar visível, e de X em X
      // tempo enquanto estiver aberta, para o aviso aparecer sem
      // depender de a pessoa fechar e reabrir a app.
      const verificarAtualizacao = () => registration.update().catch(() => {});
      setInterval(verificarAtualizacao, 60 * 60 * 1000); // de hora a hora
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') verificarAtualizacao();
      });
    })
    .catch(error => console.error('Falha no registo do Service Worker:', error));
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then(response => {
      const contentType = response.headers.get('content-type');
      const isNotFound = response.status === 404;
      const isNotScript = contentType && !contentType.includes('javascript');

      if (isNotFound || isNotScript) {
        navigator.serviceWorker.ready.then(reg =>
          reg.unregister().then(() => window.location.reload())
        );
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Sem ligação à internet. App em modo offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => registration.unregister())
      .catch(error => console.error(error.message));
  }
}
