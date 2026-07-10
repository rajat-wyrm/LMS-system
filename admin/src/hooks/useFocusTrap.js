import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps keyboard focus inside a drawer/modal panel while it is open.
 *
 * - Moves focus into the panel as soon as it opens (first focusable element,
 *   or the panel itself if nothing focusable is found).
 * - Keeps Tab / Shift+Tab cycling within the panel only; since Tab/Shift+Tab
 *   are intercepted and redirected at the document level, the background
 *   page can never receive focus via keyboard while the panel is open.
 * - Calls onClose when Escape is pressed (if provided).
 * - Restores focus to whatever element opened the panel once it closes.
 *
 * Usage: const panelRef = useFocusTrap(isOpen, onClose);
 * Attach panelRef to the panel's root motion.div.
 */
export function useFocusTrap(isOpen, onClose) {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const focusFirstElement = () => {
      const node = panelRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        node.focus();
      }
    };

    // Defer until after the panel has mounted/animated in.
    const raf = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) {
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key !== 'Tab') return;
      const node = panelRef.current;
      if (!node) return;

      const focusables = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !node.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      const toRestore = previouslyFocusedRef.current;
      if (toRestore && typeof toRestore.focus === 'function') {
        toRestore.focus();
      }
    };
  }, [isOpen, onClose]);

  return panelRef;
}

/**
 * Lighter-weight companion for non-modal, docked panels (e.g. an inline
 * detail sidebar that sits next to a list, with no backdrop). Moves focus
 * into the panel when it opens and closes it on Escape, but deliberately
 * does NOT trap Tab — these panels live alongside other interactive page
 * content (like the list that opened them) that the user still needs to
 * reach via keyboard, so trapping focus here would break navigation.
 *
 * Usage: const panelRef = useAutoFocusPanel(isOpen, onClose);
 */
export function useAutoFocusPanel(isOpen, onClose) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const focusFirstElement = () => {
      const node = panelRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        node.focus();
      }
    };

    const raf = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return panelRef;
}

/**
 * Focus trap for menu/dropdown patterns (e.g. an account/profile dropdown
 * opened from a trigger button) where the trigger button itself must remain
 * part of the keyboard cycle, so the user can Tab back to it and press
 * Enter/Space to close the menu — unlike a modal, where the trigger is
 * deliberately excluded from the trap.
 *
 * - Moves focus into the panel as soon as it opens.
 * - Tab/Shift+Tab cycle through: panel's focusable elements -> trigger ->
 *   back to the panel's first focusable element (and vice versa). The
 *   background page never receives focus while the menu is open.
 * - Escape closes the menu and returns focus to the trigger.
 * - Closing the menu (via Enter on the trigger, Escape, or an outside click)
 *   restores focus to the trigger button.
 *
 * Usage:
 *   const triggerRef = useRef(null);
 *   const panelRef = useMenuFocusTrap(isOpen, onClose, triggerRef);
 *   Attach triggerRef to the trigger <button> and panelRef to the panel.
 */
export function useMenuFocusTrap(isOpen, onClose, triggerRef) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    // Capture trigger element at open-time so the cleanup can reliably return
    // focus to it even if the ref has been cleared by then.
    const triggerEl = triggerRef?.current;

    const focusFirstElement = () => {
      const node = panelRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        node.focus();
      }
    };

    const raf = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) {
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key !== 'Tab') return;
      const node = panelRef.current;
      if (!node) return;

      const panelFocusables = Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      const cycle = triggerEl ? [triggerEl, ...panelFocusables] : panelFocusables;
      if (cycle.length === 0) {
        e.preventDefault();
        return;
      }

      const first = cycle[0];
      const last = cycle[cycle.length - 1];
      const active = document.activeElement;
      const activeIndex = cycle.indexOf(active);

      if (e.shiftKey) {
        if (activeIndex <= 0) {
          e.preventDefault();
          last.focus();
        } else {
          e.preventDefault();
          cycle[activeIndex - 1].focus();
        }
      } else {
        if (activeIndex === -1 || activeIndex === cycle.length - 1) {
          e.preventDefault();
          first.focus();
        } else {
          e.preventDefault();
          cycle[activeIndex + 1].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (triggerEl && typeof triggerEl.focus === 'function') {
        triggerEl.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  return panelRef;
}
