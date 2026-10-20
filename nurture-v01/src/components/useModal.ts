import { useEffect, useRef, type RefObject } from 'react';

export function useModal(open: boolean, dialog: RefObject<HTMLDialogElement | null>, restore: RefObject<HTMLElement | null>, onClose: () => void) {
  const dismiss = useRef(onClose);
  dismiss.current = onClose;
  useEffect(() => {
    const element = dialog.current!;
    if (!open) { if (element.open) element.close(); return; }
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = () => dismiss.current();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = [...element.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(control => control.getClientRects().length > 0);
      if (!controls.length) { event.preventDefault(); element.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!element.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    };
    element.addEventListener('close', close);
    element.addEventListener('keydown', trap);
    return () => {
      element.removeEventListener('close', close);
      element.removeEventListener('keydown', trap);
      document.body.style.overflow = previous;
      if (element.open) element.close();
      restore.current?.focus({ preventScroll: true });
    };
  }, [open, dialog, restore]);
}
