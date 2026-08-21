// Lightweight, zero-dependency toast notification helper

export const toast = {
  success: (msg: string) => {
    if (typeof window !== 'undefined') {
      showDOMToast(msg, 'success');
    }
  },
  error: (msg: string) => {
    if (typeof window !== 'undefined') {
      showDOMToast(msg, 'error');
    }
  },
  loading: (msg: string) => {
    if (typeof window !== 'undefined') {
      showDOMToast(msg, 'loading');
    }
  },
};

export default toast;

function showDOMToast(message: string, type: 'success' | 'error' | 'loading') {
  if (typeof document === 'undefined') return;
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  const bg =
    type === 'success'
      ? 'bg-emerald-600 text-white'
      : type === 'error'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-800 text-white';

  toastEl.className = `px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-200 ${bg}`;
  toastEl.textContent = message;

  container.appendChild(toastEl);

  requestAnimationFrame(() => {
    toastEl.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toastEl.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 250);
  }, 3500);
}
