/* <app-changelog src="changelog.json" lang="en"></app-changelog>
 *
 * A "?" button with the date of the last update; a tap opens the list of major changes.
 * One file with no dependencies, so the same element works in the plain-HTML, React and Vue apps.
 *
 * This file is copied into each app by scripts/sync-shared.sh: edit shared/changelog-widget.js,
 * never a copy.
 *
 * changelog.json is a list, newest first:
 *   [{ "date": "2026-10-11", "changes": ["One line per change", { "en": "…", "zh": "…" }] }]
 * A change is a string, or one string per language for an app that has both.
 */
(function () {
  if (!window.customElements || customElements.get('app-changelog')) return;

  const TEXT = {
    en: { updated: 'Updated', title: 'What’s new', close: 'Close', locale: 'en-US' },
    zh: { updated: '最後更新', title: '更新紀錄', close: '關閉', locale: 'zh-TW' }
  };

  const STYLE = `
    :host { display: inline-block; font: inherit; color: inherit; }
    button { font: inherit; color: inherit; background: none; border: 0; margin: 0; cursor: pointer;
             -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    .open { display: inline-flex; align-items: center; gap: 0.5em; min-height: 44px; padding: 0 12px;
            border-radius: 999px; }
    .open:active { background: rgba(100, 116, 139, 0.16); }
    @media (hover: hover) { .open:hover { background: rgba(100, 116, 139, 0.12); } }
    .open:focus-visible, .close:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    .mark { display: inline-flex; align-items: center; justify-content: center; flex: none;
            width: 1.7em; height: 1.7em; border: 1.5px solid currentColor; border-radius: 50%;
            font-weight: 700; line-height: 1; }

    dialog { padding: 0; border: 0; border-radius: 16px; width: min(30rem, calc(100vw - 32px));
             max-height: 80vh; color: #1e293b; background: #fff; text-align: left;
             font-size: 16px; line-height: 1.5; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
             -webkit-user-select: text; user-select: text; }
    dialog[open] { display: flex; flex-direction: column; }
    dialog::backdrop { background: rgba(15, 23, 42, 0.45); }
    header { display: flex; align-items: center; justify-content: space-between; gap: 12px;
             padding: 8px 8px 8px 20px; border-bottom: 1px solid #e2e8f0; }
    h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .close { width: 44px; height: 44px; border-radius: 50%; font-size: 24px; line-height: 1; color: #475569; }
    .close:active { background: #e2e8f0; }
    .list { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
            padding: 4px 20px 20px; }
    h3 { margin: 16px 0 4px; font-size: 14px; font-weight: 700; color: #475569; }
    ul { margin: 0; padding-left: 1.2em; }
    li { margin: 4px 0; }
  `;

  class AppChangelog extends HTMLElement {
    static get observedAttributes() { return ['lang', 'src']; }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.load();
    }

    attributeChangedCallback(name, before, after) {
      if (before === after || !this.shadowRoot) return;
      if (name === 'src') this.load();
      else this.render();
    }

    get language() {
      const lang = this.getAttribute('lang') || document.documentElement.lang || 'en';
      return lang.toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
    }

    load() {
      const src = this.getAttribute('src') || 'changelog.json';
      if (src === this.loadedSrc) return;
      this.loadedSrc = src;
      // 'no-cache' asks the server each time, so a new entry shows without a version bump.
      fetch(src, { cache: 'no-cache' })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((entries) => {
          this.entries = Array.isArray(entries) ? entries.filter((e) => e && e.date && Array.isArray(e.changes)) : [];
          this.render();
        })
        // No list (offline, or opened from file://): show nothing instead of a button that does nothing.
        .catch(() => { this.entries = []; this.render(); });
    }

    formatDate(isoDate) {
      const date = new Date(isoDate + 'T00:00:00');
      if (isNaN(date)) return isoDate;
      try {
        return new Intl.DateTimeFormat(TEXT[this.language].locale, { dateStyle: 'medium' }).format(date);
      } catch (e) {
        return isoDate;
      }
    }

    render() {
      const root = this.shadowRoot;
      const wasOpen = !!(root.querySelector('dialog') || {}).open;
      root.textContent = '';
      if (!this.entries || this.entries.length === 0) return;

      const lang = this.language;
      const text = TEXT[lang];
      const el = (tag, className, content) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (content) node.textContent = content;
        return node;
      };

      const style = el('style');
      style.textContent = STYLE;

      const open = el('button', 'open');
      open.type = 'button';
      open.setAttribute('aria-haspopup', 'dialog');
      open.setAttribute('aria-label', text.title + ' — ' + text.updated + ' ' + this.formatDate(this.entries[0].date));
      const mark = el('span', 'mark', '?');
      mark.setAttribute('aria-hidden', 'true');
      open.append(mark, el('span', '', text.updated + ' ' + this.formatDate(this.entries[0].date)));

      const dialog = el('dialog');
      dialog.setAttribute('aria-label', text.title);
      const header = el('header');
      const close = el('button', 'close', '×');
      close.type = 'button';
      close.setAttribute('aria-label', text.close);
      header.append(el('h2', '', text.title), close);

      const list = el('div', 'list');
      for (const entry of this.entries) {
        list.append(el('h3', '', this.formatDate(entry.date)));
        const ul = el('ul');
        for (const change of entry.changes) {
          const line = typeof change === 'string' ? change : change[lang] || change.en || change.zh;
          if (line) ul.append(el('li', '', line));
        }
        list.append(ul);
      }
      dialog.append(header, list);

      open.addEventListener('click', () => {
        if (dialog.showModal) dialog.showModal();
        else dialog.setAttribute('open', ''); // browsers from before <dialog>: shown in place
        list.scrollTop = 0;
      });
      const shut = () => (dialog.close ? dialog.close() : dialog.removeAttribute('open'));
      close.addEventListener('click', shut);
      // A tap on the dimmed area lands on the dialog element itself, not on its content.
      dialog.addEventListener('click', (event) => { if (event.target === dialog) shut(); });

      root.append(style, open, dialog);
      if (wasOpen && dialog.showModal) dialog.showModal(); // a language switch redraws the list in place
    }
  }

  customElements.define('app-changelog', AppChangelog);
})();
