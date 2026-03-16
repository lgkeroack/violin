/**
 * Custom dropdown component replacing native <select> elements.
 * Supports flat items and grouped items, keyboard navigation,
 * click-outside-to-close, and animated open/close.
 */
export class CustomDropdown {
  /**
   * @param {HTMLElement} container - Parent element to append into
   * @param {object} opts
   * @param {string} [opts.placeholder] - Text when nothing selected
   * @param {string} [opts.title] - Accessible title
   */
  constructor(container, opts = {}) {
    this.onChange = null;
    this._value = '';
    this._items = [];       // { value, label }
    this._groups = [];      // { label, items: [{value, label}] }
    this._isGrouped = false;
    this._open = false;

    this.el = document.createElement('div');
    this.el.className = 'dropdown';
    if (opts.title) this.el.title = opts.title;

    // Trigger button
    this._trigger = document.createElement('button');
    this._trigger.type = 'button';
    this._trigger.className = 'dropdown-trigger';
    this._trigger.setAttribute('aria-haspopup', 'listbox');
    this._trigger.setAttribute('aria-expanded', 'false');

    this._triggerText = document.createElement('span');
    this._triggerText.className = 'dropdown-trigger-text';
    this._triggerText.textContent = opts.placeholder || 'Select...';
    this._trigger.appendChild(this._triggerText);

    const arrow = document.createElement('span');
    arrow.className = 'dropdown-arrow';
    this._trigger.appendChild(arrow);

    this.el.appendChild(this._trigger);

    // Listbox
    this._listbox = document.createElement('div');
    this._listbox.className = 'dropdown-listbox';
    this._listbox.setAttribute('role', 'listbox');
    this.el.appendChild(this._listbox);

    // Events
    this._trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggle();
    });

    this._trigger.addEventListener('keydown', (e) => this._onKeydown(e));
    this._listbox.addEventListener('keydown', (e) => this._onKeydown(e));

    this._outsideClickHandler = (e) => {
      if (!this.el.contains(e.target)) this.close();
    };

    container.appendChild(this.el);
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this._updateDisplay();
    this._updateSelection();
  }

  /** Set flat items: [{ value, label }] */
  setItems(items) {
    this._items = items;
    this._groups = [];
    this._isGrouped = false;
    this._renderItems();
    this._updateDisplay();
  }

  /** Set grouped items: [{ label, items: [{ value, label }] }] */
  setGroupedItems(groups) {
    this._groups = groups;
    this._items = [];
    this._isGrouped = true;
    this._renderGrouped();
    this._updateDisplay();
  }

  _hasOptions() {
    if (this._isGrouped) {
      return this._groups.some(g => g.items.length > 0);
    }
    return this._items.length > 0;
  }

  _renderEmpty() {
    const empty = document.createElement('div');
    empty.className = 'dropdown-empty';
    empty.textContent = 'No options available';
    this._listbox.appendChild(empty);
  }

  _renderItems() {
    this._listbox.replaceChildren();
    if (!this._items.length) { this._renderEmpty(); return; }
    for (const item of this._items) {
      this._listbox.appendChild(this._createOption(item));
    }
  }

  _renderGrouped() {
    this._listbox.replaceChildren();
    if (!this._groups.some(g => g.items.length > 0)) { this._renderEmpty(); return; }
    for (const group of this._groups) {
      const groupEl = document.createElement('div');
      groupEl.className = 'dropdown-group';

      const groupLabel = document.createElement('div');
      groupLabel.className = 'dropdown-group-label';
      groupLabel.textContent = group.label;
      groupEl.appendChild(groupLabel);

      for (const item of group.items) {
        groupEl.appendChild(this._createOption(item));
      }
      this._listbox.appendChild(groupEl);
    }
  }

  _createOption(item) {
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.setAttribute('role', 'option');
    opt.dataset.value = item.value;
    if (item.value === this._value) opt.classList.add('selected');

    const check = document.createElement('span');
    check.className = 'dropdown-check';
    check.textContent = '\u2713';
    opt.appendChild(check);

    const label = document.createElement('span');
    label.className = 'dropdown-option-text';
    label.textContent = item.label;
    opt.appendChild(label);

    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      this._select(item.value);
      this.close();
    });

    return opt;
  }

  _select(val) {
    if (val === this._value) return;
    this._value = val;
    this._updateDisplay();
    this._updateSelection();
    this.onChange?.(val);
  }

  _updateDisplay() {
    const allItems = this._isGrouped
      ? this._groups.flatMap(g => g.items)
      : this._items;
    const found = allItems.find(i => i.value === this._value);
    this._triggerText.textContent = found ? found.label : (this._value || 'Select...');
  }

  _updateSelection() {
    const opts = this._listbox.querySelectorAll('.dropdown-option');
    for (const opt of opts) {
      opt.classList.toggle('selected', opt.dataset.value === this._value);
    }
  }

  _toggle() {
    this._open ? this.close() : this.open();
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.el.classList.add('open');
    this._trigger.setAttribute('aria-expanded', 'true');
    this._positionListbox();
    document.addEventListener('click', this._outsideClickHandler, true);

    // Scroll selected into view
    const sel = this._listbox.querySelector('.dropdown-option.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.el.classList.remove('open');
    this._trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._outsideClickHandler, true);
  }

  _positionListbox() {
    // Reset
    this._listbox.classList.remove('dropdown-listbox--above');
    const triggerRect = this._trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    if (spaceBelow < 200) {
      this._listbox.classList.add('dropdown-listbox--above');
    }
  }

  _onKeydown(e) {
    switch (e.key) {
      case 'Escape':
        this.close();
        this._trigger.focus();
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (!this._open) {
          this.open();
          e.preventDefault();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!this._open) { this.open(); return; }
        this._moveFocus(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!this._open) { this.open(); return; }
        this._moveFocus(-1);
        break;
    }
  }

  _moveFocus(dir) {
    const opts = [...this._listbox.querySelectorAll('.dropdown-option')];
    if (!opts.length) return;
    const focused = this._listbox.querySelector('.dropdown-option.focused');
    let idx = focused ? opts.indexOf(focused) + dir : (dir > 0 ? 0 : opts.length - 1);
    idx = Math.max(0, Math.min(opts.length - 1, idx));

    if (focused) focused.classList.remove('focused');
    opts[idx].classList.add('focused');
    opts[idx].scrollIntoView({ block: 'nearest' });

    // Select on arrow nav
    const val = opts[idx].dataset.value;
    this._select(val);
  }

  destroy() {
    this.close();
    this.el.remove();
  }
}
