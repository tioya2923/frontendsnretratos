const VAPID_PUBLIC_KEY = 'BOMk6zRnm2Bg6T8bVCbDv3gGESt2qlN4F0IJ6DFo68xYlu1Ue7tZ0jpJ-ICnSJJD6u-Y3j0ibVWiul7idYffmks';
const BACKEND_URL = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Edge no Android (EdgA/) não suporta corretamente notificações push de PWAs
export function isEdgeBrowser() {
  return /EdgA\/|Edg\//.test(navigator.userAgent);
}

export async function getSubscriptionStatus() {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub ? 'subscribed' : 'unsubscribed';
  } catch {
    return 'unsubscribed';
  }
}

export async function subscribeToPush(token) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  await fetch(`${BACKEND_URL}/components/save_subscription.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(sub.toJSON())
  });

  return sub;
}

export async function unsubscribeFromPush(token) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await fetch(`${BACKEND_URL}/components/delete_subscription.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ endpoint: sub.endpoint })
  });

  await sub.unsubscribe();
}
