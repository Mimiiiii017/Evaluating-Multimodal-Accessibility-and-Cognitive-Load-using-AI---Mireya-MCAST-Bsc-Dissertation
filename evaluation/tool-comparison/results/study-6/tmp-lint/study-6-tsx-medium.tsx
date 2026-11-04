
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface NavItem { label: string; href: string; icon?: string; }
interface TabItem { id: string; label: string; content: React.ReactNode; }
interface FormField { name: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea'; required?: boolean; }

const CustomButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick, children,
}) => {
  return (
    <div onClick={onClick} role="presentation" style={{ cursor: 'pointer', padding: '8px', background: 'none', border: 'none' }}>
      {children}
    </div>
  );
};


const Navigation: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useRef(`nav-menu-${Math.random().toString(36).slice(2)}`).current;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  return (
    <nav aria-label="Main">
      <button type="button" aria-expanded={false} onClick={() => setIsOpen(!isOpen)}>
        Menu
      </button>
      <ul id={menuId} hidden={!isOpen}>
        {items.map((item, index) => (
          <li key={index}>
            <a href={item.href} aria-current={item.href === currentPath ? 'page' : undefined}>
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <div></div>
    </nav>
  );
};
const Tabs: React.FC<{ tabs: TabItem[]; activeTab?: number }> = ({
  tabs, activeTab: initialActiveTab = 0,
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const tabListRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tabs"
        ref={tabListRef}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={i === activeTab}
            aria-controls={`wrong-panel-${tab.id}`}
            onClick={() => setActiveTab(i)}
            tabIndex={i === activeTab ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-button-heading-${tab.id}`}
          style={{ display: i === activeTab ? 'block' : 'none' }}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

const Form: React.FC<{
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
}> = ({
  fields,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const firstErrorRef = useRef<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    firstErrorRef.current = null;
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
        if (!firstErrorRef.current) firstErrorRef.current = field.name;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => { document.getElementById(firstErrorRef.current ?? '')?.focus(); }, 0);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => {
        const errorId = `${field.name}-error`;
        const hasError = !!errors[field.name];
        const autoCompleteMap: Record<string, string> = { email: 'email', name: 'name', phone: 'tel' };
        return (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange} required={field.required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                autoComplete={autoCompleteMap[field.name]}
              />
            )}
            {errors[field.name] && (
              <span id={errorId} role="alert" style={{ color: '#b00' }}>
                {errors[field.name]}
              </span>
            )}
          </div>
        );
      })}
      <button type="submit">Submit</button>
    </form>
  );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement;
    setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable?.length) focusable[0].focus();
      else modalRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter(el => el.offsetParent !== null);
      if (!els.length) { e.preventDefault(); modalRef.current?.focus(); return; }
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus(); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
          <h2 id={titleId}>{title}</h2>
          {children}
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};


interface DropdownOption {
  value: string;
  label: string;
}

const Dropdown: React.FC<{
  options: DropdownOption[];
  onChange: (value: string) => void;
  label?: string;
}> = ({ options, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(options[0]?.value);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listboxId = useRef(`dropdown-${Math.random().toString(36).slice(2)}`).current;

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
    btnRef.current?.focus();
  };

  const handleBtnKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIdx(Math.max(0, options.findIndex(o => o.value === selectedValue)));
      }
    } else {
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, options.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Home') { e.preventDefault(); setFocusedIdx(0); }
      else if (e.key === 'End') { e.preventDefault(); setFocusedIdx(options.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focusedIdx >= 0) handleSelect(options[focusedIdx].value); }
      else if (e.key === 'Escape') setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOpen(false); }}
    >
      {label && <label htmlFor={`${listboxId}-btn`}>{label}</label>}
      <button
        type="button"
        ref={btnRef}
        id={`${listboxId}-btn`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && focusedIdx >= 0 ? `${listboxId}-opt-${focusedIdx}` : undefined}
        onKeyDown={handleBtnKeyDown}
      >
        {options.find(opt => opt.value === selectedValue)?.label || 'Select'}
      </button>
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={`${listboxId}-btn`}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={option.value === selectedValue}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(option.value);
                }
              }}
              tabIndex={-1}
              style={{ background: i === focusedIdx ? '#eff6ff' : undefined }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


interface ListItem {
  id: string;
  title: string;
  description?: string;
}

const List: React.FC<{ items: ListItem[] }> = ({ items }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <h3 style={{ margin: '0 0 4px' }}>{item.title}</h3>
          <div>{item.description}</div>
        </li>
      ))}
    </ul>
  );
};

const LoadingSpinner: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        animation: !prefersReducedMotion ? 'spin 1s linear infinite' : undefined,
        width: '24px',
        height: '24px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #3498db',
        borderRadius: '50%',
      }}
    />
  );
};

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onDismiss }) => {
  return (
    <div
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
      style={{
        padding: '12px',
        color: type === 'error' ? '#b00' : '#1e3a8a',
        background: type === 'error' ? '#ffe0e0' : '#e0e0ff',
      }}
    >
      {message}
        
      {onDismiss && (
        <button type="button" onClick={onDismiss}>Dismiss</button>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<ListItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const tabs: TabItem[] = [
    { id: 'tab-1', label: 'Overview', content: <div>Overview content</div> },
    { id: 'tab-2', label: 'Details', content: <div>Details content</div> },
    { id: 'tab-3', label: 'Reviews', content: <div>Reviews content</div> },
  ];

  const formFields: FormField[] = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ];

  const dropdownOptions: DropdownOption[] = [
    { value: 'all', label: 'All Products' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
  ];

  const listItems: ListItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: `item-${i}`,
    title: `Product ${i + 1}`,
    description: `Description for product ${i + 1}`,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <a
        href="#main-content"
        style={{ position: 'absolute', top: '-40px', left: 0, background: '#000', color: '#fff', padding: '8px 16px', zIndex: 9999, textDecoration: 'none' }}
        onFocus={e => { e.currentTarget.style.top = '0'; }}
        onBlur={e => { e.currentTarget.style.top = '-40px'; }}
      >
        Skip to main content
      </a>
      <header>
        <h1>Study 6 App</h1>
        <Navigation items={navItems} />
      </header>

      <main id="main-content" tabIndex={-1}>
        <section aria-labelledby="welcome-heading">
          <h2 id="welcome-heading">Welcome</h2>
          <Tabs tabs={tabs} />
        </section>

        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading">Contact Us</h2>
          <Form
            fields={formFields}
            onSubmit={data => console.log('Form submitted:', data)}
          />
        </section>

        <section aria-labelledby="filter-heading">
          <h2 id="filter-heading">Filter Products</h2>
          <Dropdown
            label="Category"
            options={dropdownOptions}
            onChange={value => console.log('Selected:', value)}
          />
        </section>

        <section aria-labelledby="products-heading">
          <h2 id="products-heading">Products</h2>
          <List items={listItems} />
          <button type="button" onClick={() => setShowCart(!showCart)} aria-expanded={showCart} aria-haspopup="dialog">
            View Cart ({cartItems.length})
          </button>
        </section>

        <Modal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          title="Shopping Cart"
        >
          <List items={cartItems.length > 0 ? cartItems : [{ id: 'empty', title: 'Cart is empty' }]} />
        </Modal>

        <Alert message="Welcome to our store!" type="info" />
      </main>

      <LoadingSpinner isLoading={false} />
    </div>
  );
};

export default App;




export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) => {
  const [state, setState] = useState<{
    status: 'idle' | 'pending' | 'success' | 'error';
    data: T | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const execute = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
      return response;
    } catch (error) {
      setState({ status: 'error', data: null, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { ...state, execute };
};

export const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};


type Primitive = string | number | boolean | null | undefined;
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;


export { CustomButton, Navigation, Tabs, Form, Dropdown, Modal, List, LoadingSpinner, Alert };


type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {

  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  children: React.ReactNode;
}

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default:   { background: '#e5e7eb', color: '#374151' },
  primary:   { background: '#dbeafe', color: '#1d4ed8' },
  secondary: { background: '#e0e7ff', color: '#4338ca' },
  success:   { background: '#d1fae5', color: '#065f46' },
  warning:   { background: '#fef3c7', color: '#92400e' },
  danger:    { background: '#fee2e2', color: '#991b1b' },
  info:      { background: '#e0f2fe', color: '#0c4a6e' },
};

const BADGE_SIZES: Record<BadgeSize, React.CSSProperties> = {
  sm: { fontSize: '0.625rem', padding: '1px 6px' },
  md: { fontSize: '0.75rem',  padding: '2px 8px' },
  lg: { fontSize: '0.875rem', padding: '3px 10px' },
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'default', size = 'md', rounded = false, dot = false, children, style, ...rest
}) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500,
      borderRadius: rounded ? '9999px' : '4px',
      ...BADGE_STYLES[variant], ...BADGE_SIZES[size], ...style,
    }}
    {...rest}
  >
    {dot && (
      <span
        aria-label="●"
        style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'currentColor', flexShrink: 0,
        }}
      />
    )}
    {children}
  </span>
);


interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
  shape?: 'circle' | 'square';
  status?: 'online' | 'away' | 'busy' | 'offline';
}

const STATUS_COLORS = { online: '#16a34a', away: '#d97706', busy: '#ef4444', offline: '#6b7280' };


const Avatar: React.FC<AvatarProps> = ({
  src, alt, size = 40, fallback, shape = 'circle', status
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = fallback || alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          style={{
            width: size, height: size,
            borderRadius: shape === 'circle' ? '50%' : '6px',
            objectFit: 'cover', display: 'block',
          }}
        />
      ) : (
        <span
          role="img"
          aria-label={alt}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: size, height: size,
            borderRadius: shape === 'circle' ? '50%' : '6px',
            background: '#4f46e5', color: '#fff',
            fontSize: size * 0.35, fontWeight: 600, userSelect: 'none',
          }}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          role="img"
          style={{
            position: 'absolute', bottom: 1, right: 1,
            width: Math.max(8, size * 0.22), height: Math.max(8, size * 0.22),
            borderRadius: '50%', background: STATUS_COLORS[status],
            border: '2px solid #fff',
          }}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
};


interface TooltipProps {
  label: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ label, placement = 'top', children, delay = 150 }) => {
  const [visible, setVisible] = useState(false);
  const idRef = useRef(`tooltip-${Math.random().toString(36).slice(2)}`);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => { timerRef.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { if (timerRef.current !== null) clearTimeout(timerRef.current); setVisible(false); };

  const offsetMap: Record<string, React.CSSProperties> = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
    left:   { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 },
    right:  { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
  };

  const child = React.cloneElement(children, {
    onMouseEnter: show, onMouseLeave: hide,
    onFocus: show, onBlur: hide,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Escape') { hide(); } children.props.onKeyDown?.(e); },
    'aria-describedby': idRef.current,
    tabIndex: children.props.tabIndex ?? (children.type === 'button' || children.type === 'a' ? undefined : 0),
  });

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {child}
      <span
        id={`${idRef.current}-text`}
        role="tooltip"
        aria-hidden={!visible}
        style={{
          position: 'absolute', zIndex: 9999, whiteSpace: 'nowrap',
          background: '#1f2937', color: '#f9fafb',
          fontSize: '0.75rem', padding: '4px 8px', borderRadius: 4,
          pointerEvents: 'none',
          ...offsetMap[placement],
          visibility: visible ? 'visible' : 'hidden',
          opacity: visible ? 1 : 0,
        }}
      >
        {label}
      </span>
    </span>
  );
};


interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
}

const Accordion: React.FC<AccordionProps> = ({
  items, allowMultiple = false, defaultOpenIds = []
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        const headingId = `accordion-heading-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;
        return (
          <div key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={headingId}
                aria-expanded={isOpen}
                onClick={() => !item.disabled && toggle(item.id)}
                disabled={item.disabled}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '12px 16px', cursor: item.disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontWeight: 500,
                }}
              >
                {item.title}
                <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              style={{ padding: isOpen ? '12px 16px' : 0, overflow: 'hidden' }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage, totalPages, onPageChange, siblingCount = 1, showFirstLast = true
}) => {
  const [pageAnnouncement, setPageAnnouncement] = useState('');
  const pages = useMemo(() => {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const left  = Math.max(1, currentPage - siblingCount);
    const right = Math.min(totalPages, currentPage + siblingCount);
    const showLeftDots  = left > 2;
    const showRightDots = right < totalPages - 1;
    const result: (number | '…')[] = [];
    if (showFirstLast && left > 1) result.push(1);

    if (showLeftDots) result.push('…');
    result.push(...range(left, right));
    if (showRightDots) result.push('…');
    if (showFirstLast && right < totalPages) result.push(totalPages);
    return result;
  }, [currentPage, totalPages, siblingCount, showFirstLast]);

  return (
    <nav aria-label="Pagination">
      <span role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>{pageAnnouncement}</span>
      <ul style={{ display: 'flex', listStyle: 'none', gap: 4, padding: 0, margin: 0 }}>
        <li>
          <button
            type="button"
            onClick={() => { onPageChange(currentPage - 1); setPageAnnouncement(`Page ${currentPage - 1} of ${totalPages}`); }}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <span aria-hidden="true">‹</span>
          </button>
        </li>
        {pages.map((p, i) =>
          p === '…' ? (
            <li key={`dots-${i}`} aria-hidden="true"><span>…</span></li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => { onPageChange(p as number); setPageAnnouncement(`Page ${p} of ${totalPages}`); }}
                aria-current={p === currentPage ? 'page' : undefined}
                aria-label={`Page ${p}`}
                style={{ fontWeight: p === currentPage ? 700 : 400 }}
              >
                {p}
              </button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            onClick={() => { onPageChange(currentPage + 1); setPageAnnouncement(`Page ${currentPage + 1} of ${totalPages}`); }}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};


type SortDir = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  ariaLabel?: string;
  rowKey: keyof T;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  stickyHeader?: boolean;
}


function DataTable<T extends Record<string, unknown>>({
  columns, data, caption, ariaLabel, rowKey, selectable = false, onSelectionChange, stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<T[keyof T]>>(new Set());
  const [sortAnnouncement, setSortAnnouncement] = useState('');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const va = a[sortKey]; const vb = b[sortKey];
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: keyof T) => {
    let nextSortKey: keyof T | null = key;
    let nextSortDir: SortDir;
    if (sortKey === key) {
      nextSortDir = sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc';
      if (nextSortDir === null) nextSortKey = null;
    } else {
      nextSortDir = 'asc';
    }
    setSortKey(nextSortKey);
    setSortDir(nextSortDir);
    setSortAnnouncement(
      nextSortDir
        ? `Table sorted by ${String(key)} ${nextSortDir === 'asc' ? 'ascending' : 'descending'}`
        : `Sorting cleared for ${String(key)}`
    );
  };

  const toggleRow = (id: T[keyof T], row: T) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    onSelectionChange?.(data.filter(r => next.has(r[rowKey])));
  };

  const toggleAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      setSelected(new Set(data.map(r => r[rowKey])));
      onSelectionChange?.(data);
    }
  };

  const captionId = useRef(`table-caption-${Math.random().toString(36).slice(2)}`).current;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {sortAnnouncement}
      </div>
      <table aria-labelledby={caption ? captionId : undefined} aria-label={!caption ? ariaLabel : undefined} style={{ borderCollapse: 'collapse', width: '100%' }}>
        {caption && <caption id={captionId}>{caption}</caption>}
        <thead style={stickyHeader ? { position: 'sticky', top: 0, background: '#fff', zIndex: 1 } : {}}>
          <tr>
            {selectable && (
              <th scope="col" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={selected.size === data.length && data.length > 0}
                  ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < data.length; }}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={String(col.key)}
                scope="col"
                aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none') : 'none'}
                style={{ width: col.width, padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 'inherit', display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}
                  >
                    {col.header}
                    <span aria-hidden="true">{sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : sortDir === 'desc' ? ' ↓' : '') : ''}</span>
                  </button>
                ) : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map(row => {
            const id = row[rowKey];
            return (
              <tr
                key={String(id)}
                aria-selected={selectable ? selected.has(id) : undefined}
                style={{ background: selected.has(id) ? '#eff6ff' : undefined }}
              >
                {selectable && (
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="checkbox"
                      aria-label={`Select row ${String(id)}`}
                      checked={selected.has(id)}
                      onChange={() => toggleRow(id, row)}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={String(col.key)} style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
  removeAll: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
};

const TOAST_BG: Record<ToastType, string> = {
  success: '#f0fdf4', error: '#fef2f2', warning: '#fffbeb', info: '#eff6ff',
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const cancelTimer = useCallback((id: string) => {
    const t = timerMapRef.current.get(id);
    if (t !== undefined) { clearTimeout(t); timerMapRef.current.delete(id); }
  }, []);

  const startTimer = useCallback((id: string, duration: number) => {
    cancelTimer(id);
    const t = setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
      timerMapRef.current.delete(id);
    }, duration);
    timerMapRef.current.set(id, t);
  }, [cancelTimer]);

  const add = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    if (toast.duration !== 0) {
      startTimer(id, toast.duration ?? 5000);
    }
  }, [startTimer]);

  const remove = useCallback((id: string) => {
    cancelTimer(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, [cancelTimer]);

  const removeAll = useCallback(() => { timerMapRef.current.forEach((_, id) => cancelTimer(id)); setToasts([]); }, [cancelTimer]);

  return (
    <ToastContext.Provider value={{ add, remove, removeAll }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
        }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
            onMouseEnter={() => cancelTimer(toast.id)}
            onMouseLeave={() => { if (toast.duration !== 0) startTimer(toast.id, toast.duration ?? 5000); }}
            onFocus={() => cancelTimer(toast.id)}
            onBlur={() => { if (toast.duration !== 0) startTimer(toast.id, toast.duration ?? 5000); }}
            style={{
              background: TOAST_BG[toast.type], padding: '12px 16px',
              borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.15)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '1.1rem', flexShrink: 0 }}>
              {TOAST_ICONS[toast.type]}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={toast.action.onClick}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: 4, fontWeight: 600 }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              aria-label="Close"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};


interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  id: string;
  allowFreeText?: boolean;
  maxVisible?: number;
  noResultsText?: string;
  required?: boolean;
  error?: boolean;
}



const Combobox: React.FC<ComboboxProps> = ({
  options, value, onChange, placeholder = 'Search…', label, id,
  allowFreeText = false, maxVisible = 8, noResultsText = 'No results', required = false, error = false,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `${id}-listbox`;

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, maxVisible);
    const q = query.toLowerCase();
    return options.filter(o => !o.disabled && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))).slice(0, maxVisible);
  }, [options, query, maxVisible]);

  const select = (opt: ComboboxOption) => {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
    setAnnouncement(`${opt.label} selected`);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); setActiveIdx(0); return; }
    if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Home') { e.preventDefault(); setActiveIdx(0); }
    if (e.key === 'End') { e.preventDefault(); setActiveIdx(filtered.length - 1); }
    if (e.key === 'Enter' && activeIdx >= 0 && filtered[activeIdx]) { select(filtered[activeIdx]); }
    if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor={id}>{label}</label>
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {announcement}
      </div>
      <input

        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-invalid={error || undefined}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIdx >= 0 ? `${listId}-option-${activeIdx}` : undefined}
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setAnnouncement(filtered.length ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} available` : noResultsText);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => {
          const nextValue = e.target.value;
          const nextFiltered = options.filter(o => !o.disabled && (o.label.toLowerCase().includes(nextValue.toLowerCase()) || o.value.toLowerCase().includes(nextValue.toLowerCase()))).slice(0, maxVisible);
          setQuery(nextValue);
          setOpen(true);
          setActiveIdx(0);
          setAnnouncement(nextFiltered.length ? `${nextFiltered.length} result${nextFiltered.length === 1 ? '' : 's'} available` : noResultsText);
          if (allowFreeText) onChange(nextValue);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: '#fff', border: '1px solid #6b7280', borderRadius: 6,
            listStyle: 'none', margin: 0, padding: 4, maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: '8px 12px', color: '#6b7280' }}>{noResultsText}</li>
          ) : filtered.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listId}-option-${i}`}
              role="option"
              aria-selected={opt.value === value}
              aria-disabled={opt.disabled}
              onMouseDown={() => select(opt)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                padding: '8px 12px', cursor: 'pointer', borderRadius: 4,
                background: i === activeIdx ? '#eff6ff' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: opt.disabled ? 0.4 : 1,
              }}
            >
              {opt.icon && <span aria-hidden="true">{opt.icon}</span>}
              <div>
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                {opt.description && <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>{opt.description}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  striped?: boolean;
  animated?: boolean;
}

const PROGRESS_HEIGHT = { sm: 4, md: 8, lg: 12 };


const Progress: React.FC<ProgressProps> = ({
  value, max = 100, label, showLabel = false, size = 'md', color = '#6366f1', striped = false, animated = false,
}) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const h = PROGRESS_HEIGHT[size];
  const id = useRef(`progress-${Math.random().toString(36).slice(2)}`).current;

  return (
    <div>
      {label && <span id={id} style={{ fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? id : undefined}
        aria-label={!label ? `${pct.toFixed(0)}%` : undefined}
        style={{
          width: '100%', height: h, background: '#e5e7eb', borderRadius: h / 2, overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%', width: `${pct}%`, background: color, borderRadius: h / 2,
            transition: 'width 0.3s ease',
            backgroundImage: striped
              ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,.2) 5px, rgba(255,255,255,.2) 10px)'
              : undefined,
            animation: (animated && !prefersReducedMotion) ? 'progress-stripe 1s linear infinite' : undefined,
          }}
        />
      </div>
      {showLabel && <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>{pct.toFixed(0)}%</span>}
    </div>
  );
};


interface Step {



  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
  completedSteps?: Set<number>;
}

const Stepper: React.FC<StepperProps> = ({
  steps, currentStep, orientation = 'horizontal', onStepClick, completedSteps = new Set(),
}) => {
  return (
    <ol
      aria-label="Progress"
      style={{
        display: 'flex', flexDirection: orientation === 'vertical' ? 'column' : 'row',
        listStyle: 'none', padding: 0, margin: 0, gap: 0,
      }}
    >
      {steps.map((step, i) => {
        const done = completedSteps.has(i);
        const active = i === currentStep;
        const upcoming = i > currentStep && !done;
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            style={{ flex: 1, display: 'flex', flexDirection: orientation === 'vertical' ? 'row' : 'column', alignItems: orientation === 'vertical' ? 'flex-start' : 'center', gap: 8 }}
          >
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              aria-label={`Step ${i + 1}: ${step.label}${done ? ' (completed)' : active ? ' (current)' : ''}`}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                borderColor: done ? '#15803d' : active ? '#4f46e5' : '#6b7280',
                background: done ? '#15803d' : active ? '#4f46e5' : '#fff',
                color: (done || active) ? '#fff' : 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, cursor: onStepClick ? 'pointer' : 'default',
                flexShrink: 0,
              }}
            >
              {done ? <span aria-hidden="true">✓</span> : i + 1}
            </button>
            <div>
              <div style={{ fontWeight: active ? 600 : 400, color: upcoming ? '#6b7280' : 'inherit' }}>
                {step.label}
                {step.optional && <span style={{ fontSize: '0.75rem', marginLeft: 4, color: '#6b7280' }}>(optional)</span>}
              </div>
              {step.description && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{step.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};


const DAYS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  label: string;
  id: string;
  disabledDates?: Date[];
}




const DatePicker: React.FC<DatePickerProps> = ({
  value, onChange, min, max, label, id, disabledDates = [],
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ?? new Date());
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogId = `${id}-calendar`;

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isDisabled = (d: number) => {
    const dt = new Date(year, month, d);
    if (min && dt < min) return true;
    if (max && dt > max) return true;
    return disabledDates.some(x => x.toDateString() === dt.toDateString());
  };

  const isSelected = (d: number) => value && new Date(year, month, d).toDateString() === value.toDateString();
  const isToday = (d: number) => new Date(year, month, d).toDateString() === new Date().toDateString();

  const select = (d: number) => { onChange(new Date(year, month, d)); setOpen(false); setFocusedDay(null); document.getElementById(id)?.focus(); };

  useEffect(() => {
    if (focusedDay !== null && dialogRef.current) {
      dialogRef.current.querySelector<HTMLButtonElement>(`[data-day="${focusedDay}"]`)?.focus();
    }
  }, [focusedDay]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleDialogKeys = (e: KeyboardEvent) => {
      if (!dialogRef.current) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setFocusedDay(null);
        triggerRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current.contains(document.activeElement)) {
        return;
      }

      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'));
      if (!focusables.length) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeys);
    return () => {
      document.removeEventListener('keydown', handleDialogKeys);
    };
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        readOnly
        value={value ? value.toLocaleDateString() : ''}
        placeholder="Select date"
        onClick={() => {
          if (open) { setOpen(false); setFocusedDay(null); }
          else { setOpen(true); setFocusedDay(value && value.getFullYear() === year && value.getMonth() === month ? value.getDate() : 1); }
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            setOpen(false);
            setFocusedDay(null);
            return;
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (open) {
              setOpen(false);
              setFocusedDay(null);
            } else {
              setOpen(true);
              setFocusedDay(value && value.getFullYear() === year && value.getMonth() === month ? value.getDate() : 1);
            }
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={false}
        style={{ cursor: 'pointer' }}
      />
      {open && (
        <div
          id={dialogId}
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          aria-label={`Choose date, ${MONTHS[month]} ${year}`}
          style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 200,
            background: '#fff', border: '1px solid #6b7280', borderRadius: 8,
            padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 280,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month - 1, 1)); setFocusedDay(1); }}
              aria-label="Previous month"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            ><span aria-hidden="true">‹</span></button>
            <span aria-live="polite" style={{ fontWeight: 600 }}>{MONTHS[month]} {year}</span>
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month + 1, 1)); setFocusedDay(1); }}
              aria-label="Next month"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            ><span aria-hidden="true">›</span></button>
          </div>
          <table role="grid" aria-label={`${MONTHS[month]} ${year}`}
            onKeyDown={(e) => {
              if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
              e.preventDefault();
              const current = focusedDay ?? 1;
              let newDay = current, nd = year, nm = month;
              if (e.key === 'ArrowLeft') {
                if (current > 1) { newDay = current - 1; }
                else { nm = month === 0 ? 11 : month - 1; if (month === 0) nd = year - 1; newDay = new Date(nd, nm + 1, 0).getDate(); setViewDate(new Date(nd, nm, 1)); }
              } else if (e.key === 'ArrowRight') {
                if (current < daysInMonth) { newDay = current + 1; }
                else { nm = month === 11 ? 0 : month + 1; if (month === 11) nd = year + 1; newDay = 1; setViewDate(new Date(nd, nm, 1)); }
              } else if (e.key === 'ArrowUp') {
                if (current - 7 >= 1) { newDay = current - 7; }
                else { nm = month === 0 ? 11 : month - 1; if (month === 0) nd = year - 1; const pd = new Date(nd, nm + 1, 0).getDate(); newDay = pd - (7 - current) + 1; setViewDate(new Date(nd, nm, 1)); }
              } else if (e.key === 'ArrowDown') {
                if (current + 7 <= daysInMonth) { newDay = current + 7; }
                else { nm = month === 11 ? 0 : month + 1; if (month === 11) nd = year + 1; newDay = current + 7 - daysInMonth; setViewDate(new Date(nd, nm, 1)); }
              } else if (e.key === 'Home') {
                const col = (firstDay + current - 1) % 7; newDay = Math.max(1, current - col);
              } else if (e.key === 'End') {
                const col = (firstDay + current - 1) % 7; newDay = Math.min(daysInMonth, current + (6 - col));
              }
              setFocusedDay(newDay);
            }}
          >
            <thead>
              <tr>
                {DAYS.map(d => (
                  <th key={d} scope="col" abbr={d} style={{ textAlign: 'center', padding: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <tr key={row}>
                  {cells.slice(row * 7, row * 7 + 7).map((day, col) => (
                    <td key={col} aria-hidden={day ? undefined : true} aria-selected={day ? !!isSelected(day) : undefined} style={{ textAlign: 'center', padding: '2px' }}>
                      {day ? (
                        <button
                          type="button"
                          data-day={day}
                          tabIndex={focusedDay === day ? 0 : -1}
                          onClick={() => !isDisabled(day) && select(day)}
                          disabled={isDisabled(day)}
                          aria-label={`${day} ${MONTHS[month]} ${year}`}
                          aria-current={isToday(day) ? 'date' : undefined}
                          style={{
                            width: 32, height: 32, border: 'none', borderRadius: '50%', cursor: 'pointer',
                            background: isSelected(day) ? '#4f46e5' : isToday(day) ? '#eff6ff' : 'transparent',
                            color: isSelected(day) ? '#fff' : isDisabled(day) ? '#9ca3af' : 'inherit',
                            fontWeight: isToday(day) ? 600 : 400,
                          }}
                        >
                          {day}
                        </button>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


interface RatingProps {
  value: number;
  max?: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  label: string;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({ value, max = 5, onChange, readonly = false, label, size = 24 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  // State exists so event handlers compile; the intentional accessibility issue is the missing aria-live region
  const [liveMsg, setLiveMsg] = useState('');
  const groupId = useRef(`rating-${Math.random().toString(36).slice(2)}`).current;

  const effective = hovered ?? value;

  if (readonly) {
    return (
      <div role="img" aria-label={`${label}: ${value} out of ${max} stars`} style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(star => (
          <span key={star} aria-hidden="true" style={{ display: 'inline-block', fontSize: size, color: star <= value ? '#d97706' : '#6b7280' }}>★</span>
        ))}
      </div>
    );
  }

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend>{label}</legend>
      <span role="status" aria-live="off" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>{liveMsg}</span>
      <div
        style={{ display: 'flex', gap: 2 }}
        onMouseLeave={() => setHovered(null)}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map(star => (
          <React.Fragment key={star}>
            <input
              type="radio"
              id={`${groupId}-${star}`}
              name={groupId}
              value={star}
              checked={value === star}
              onChange={() => onChange?.(star)}
              disabled={readonly}
              style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}
              aria-label={`${star} out of ${max} stars`}
              onFocus={() => { if (!readonly) { setHovered(star); setLiveMsg(`${star} out of ${max} stars`); } }}
              onBlur={() => { setHovered(null); setLiveMsg(''); }}
            />
            <label
              htmlFor={`${groupId}-${star}`}
              onMouseEnter={() => !readonly && setHovered(star)}
              style={{ cursor: readonly ? 'default' : 'pointer', lineHeight: 1 }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block', fontSize: size,
                  color: star <= effective ? '#d97706' : '#6b7280',
                  transition: 'color 0.1s',
                }}
              >
                ★
              </span>
            </label>
          </React.Fragment>
        ))}
      </div>
    </fieldset>
  );
};


interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesSelected: (files: File[]) => void;
  label: string;
  id: string;
  description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept, multiple = false, maxSizeMb = 10, onFilesSelected, label, id, description,
}) => {
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const descId = `${id}-desc`;
  const errId = `${id}-err`;

  const MAX_BYTES = maxSizeMb * 1024 * 1024;

  const validate = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) { setError(`"${file.name}" exceeds ${maxSizeMb} MB limit.`); return; }
    }
    setError(null);
    valid.push(...Array.from(files));
    onFilesSelected(valid);
  };

  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 500 }}>{label}</label>
      {description && <p id={descId} style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>{description}</p>}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); validate(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#6b7280'}`,
          borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer',
          background: dragging ? '#f0f4ff' : '#fafafa',
          transition: 'all 0.15s',
          outline: focused ? '2px solid #6366f1' : 'none',
          outlineOffset: focused ? 2 : undefined,
        }}
        role="button"
        tabIndex={0}
        aria-describedby={[description ? descId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <span aria-hidden="true" style={{ fontSize: 36 }}>📂</span>
        <p style={{ margin: '8px 0 0' }}>Drag and drop files here, or click to browse</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>
          {accept ? `Accepted: ${accept}` : 'All file types'} · Max {maxSizeMb} MB
        </p>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => validate(e.target.files)}
          tabIndex={-1}
          style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}
          aria-describedby={[description ? descId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error || undefined}
        />
      </div>
      {error && (
        <p id={errId} role="alert" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
};


const COLOR_PRESETS = [
  '#ef4444','#f97316','#f59e0b','#eab308',
  '#84cc16','#22c55e','#14b8a6','#06b6d4',
  '#3b82f6','#6366f1','#8b5cf6','#ec4899',
  '#6b7280','#374151','#1f2937','#000000',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  id: string;
  showInput?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label, id, showInput = true }) => {
  const [customColor, setCustomColor] = useState(value);

  return (
    <div aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>{label}</span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
          e.preventDefault();
          const idx = COLOR_PRESETS.indexOf(value);
          const next = (e.key === 'ArrowRight' || e.key === 'ArrowDown')
            ? (idx + 1) % COLOR_PRESETS.length
            : (idx - 1 + COLOR_PRESETS.length) % COLOR_PRESETS.length;
          onChange(COLOR_PRESETS[next]);
          (e.currentTarget.querySelectorAll('button')[next] as HTMLButtonElement)?.focus();
        }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: showInput ? 8 : 0 }}
      >
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-label={`Select color ${color}`}
            aria-checked={value === color}
            tabIndex={value === color ? 0 : -1}
            onClick={() => onChange(color)}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: value === color ? '3px solid #6366f1' : '1px solid #6b7280',
              background: color, cursor: 'pointer',
              boxShadow: value === color ? `0 0 0 2px #fff, 0 0 0 4px ${color}` : undefined,
            }}
          />
        ))}
      </div>
      {showInput && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor={`${id}-custom`} style={{ fontSize: '0.875rem' }}>Custom:</label>
          <input
            id={`${id}-custom`}
            type="color"
            value={customColor}
            onChange={e => { setCustomColor(e.target.value); onChange(e.target.value); }}
            style={{ width: 40, height: 32, padding: 2, border: '1px solid #6b7280', borderRadius: 4 }}
          />
          <input
            type="text"
            value={customColor}
            maxLength={7}
            pattern="^#[0-9a-fA-F]{6}$"
            onChange={e => {
              const v = e.target.value;
              setCustomColor(v);
              if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
            }}
            aria-label="Hex color value"
            style={{ width: 90, padding: '4px 8px', border: '1px solid #6b7280', borderRadius: 4, fontFamily: 'monospace' }}
          />
        </div>
      )}
    </div>
  );
};


interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text', width = '100%', height, lines = 1, animated = true,
}) => {
  const baseStyle: React.CSSProperties = {
    background: animated
      ? 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)'
      : '#f3f4f6',
    backgroundSize: '200% 100%',
    animation: animated ? 'skeleton-shine 0.4s ease-in-out infinite' : undefined,
    borderRadius: variant === 'circle' ? '50%' : variant === 'rect' ? 8 : 4,
    display: 'block',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div aria-busy="true" aria-label="Loading content">
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              ...baseStyle,
              width: i === lines - 1 ? '70%' : width,
              height: height ?? '1em',
              display: 'block',
              marginBottom: i < lines - 1 ? '0.5em' : 0,
            }}
          />
        ))}
      </div>
    );
  }

  const finalWidth = variant === 'circle' ? (height ?? 40) : width;
  return (
    <span
      role="status"
      aria-busy="true"
      aria-label="Loading"
      style={{ ...baseStyle, width: finalWidth, height: height ?? (variant === 'text' ? '1em' : variant === 'circle' ? 40 : 80), display: 'inline-block' }}
    />
  );
};


interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  showCopy?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code, language = 'text', filename, showLineNumbers = false, highlightLines = [], showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  return (
    <figure aria-label={!filename ? 'Code block' : undefined} style={{ margin: 0 }}>
      {filename && <figcaption style={{ padding: '4px 12px', background: '#374151', color: '#d1d5db', fontSize: '0.75rem', borderRadius: '6px 6px 0 0' }}>{filename}</figcaption>}
      <div style={{ position: 'relative' }}>
        <span role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
          {copied ? 'Copied to clipboard' : copyError ? 'Failed to copy' : ''}
        </span>
        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : copyError ? 'Copy failed' : 'Copy code'}
            style={{
              position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,.1)',
              border: 'none', color: '#e5e7eb', borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
            }}
          >
            {copied ? <><span aria-hidden="true">✓</span> Copied</> : copyError ? <><span aria-hidden="true">✗</span> Failed</> : 'Copy'}
          </button>
        )}
        <pre
          aria-label={`${language || 'code'} block`}
          style={{
            margin: 0, padding: 16, background: '#1f2937', color: '#f9fafb',
            borderRadius: filename ? '0 0 6px 6px' : 6,
            overflowX: 'auto', fontSize: '0.875rem', lineHeight: 1.6,
          }}
        >
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              lines.map((line, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    background: highlightLines.includes(i + 1) ? 'rgba(255,255,0,.1)' : undefined,
                  }}
                >
                  <span aria-hidden="true" style={{ display: 'inline-block', width: 32, textAlign: 'right', marginRight: 12, color: '#6b7280', userSelect: 'none' }}>
                    {i + 1}
                  </span>
                  {line}
                </span>
              ))
            ) : code}
          </code>
        </pre>
      </div>
    </figure>
  );
};


interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
  marks?: { value: number; label: string }[];
  showTooltip?: boolean;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value, min = 0, max = 100, step = 1, onChange, label, id, marks = [], showTooltip = true, disabled = false,
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label htmlFor={id} style={{ fontWeight: 500 }}>{label}</label>
        <output htmlFor={id} aria-live="off" style={{ fontSize: '0.875rem', color: '#6b7280' }}>{value}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{ width: '100%', accentColor: '#6366f1' }}
      />
      {marks.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {marks.map(m => (
            <span
              key={m.value}
              style={{ fontSize: '0.75rem', color: '#6b7280' }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};



function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return size;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

function useEventListener<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  target: EventTarget = window,
  options?: AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);
  useEffect(() => {
    const el = target;
    const fn = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    el.addEventListener(eventType, fn, options);
    return () => el.removeEventListener(eventType, fn, options);
  }, [eventType, target, options]);
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

function useCopyToClipboard(): [boolean, boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }, []);
  return [copied, failed, copy];
}

// WARNING: This hook only locks scroll. Consumers must implement focus-trap and aria-modal for correct modal accessibility.
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => { document.body.style.overflow = prev; document.body.style.paddingRight = prevPadding; };
  }, [locked]);
}

function useVirtualList<T>(
  items: T[],
  options: { itemHeight: number; containerHeight: number; overscan?: number },
) {
  const [scrollTop, setScrollTop] = useState(0);
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIdx   = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIdx, endIdx + 1).map((item, i) => ({ item, index: startIdx + i, setSize: items.length, posInSet: startIdx + i + 1 }));
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetTop: startIdx * itemHeight,
    role: 'list' as const,
    tabIndex: 0,
    onScroll: (e: React.UIEvent<HTMLElement>) => setScrollTop(e.currentTarget.scrollTop),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement || (e.target as HTMLElement).isContentEditable;
      const el = e.currentTarget as HTMLElement;
      const maxScroll = (items.length - 1) * itemHeight;
      if (e.key === 'Home' && !isInput) { e.preventDefault(); el.scrollTop = 0; }
      if (e.key === 'End' && !isInput) { e.preventDefault(); el.scrollTop = maxScroll; }
      if (e.key === 'PageDown' && !isInput) { e.preventDefault(); el.scrollTop = Math.min(el.scrollTop + containerHeight, maxScroll); }
      if (e.key === 'PageUp' && !isInput) { e.preventDefault(); el.scrollTop = Math.max(0, el.scrollTop - containerHeight); }
      if (e.key === 'ArrowDown' && !isInput) { e.preventDefault(); el.scrollTop = Math.min(el.scrollTop + itemHeight, maxScroll); }
      if (e.key === 'ArrowUp' && !isInput) { e.preventDefault(); el.scrollTop = Math.max(0, el.scrollTop - itemHeight); }
    },
    scrollToIndex: (index: number) => setScrollTop(Math.max(0, index * itemHeight)),
  };
}


type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  mode: 'system', resolvedMode: 'light', setMode: () => {}, toggle: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (localStorage.getItem('theme') as ThemeMode) ?? 'system',
  );
  const [announcement, setAnnouncement] = useState('');
  const themeInitialMount = useRef(true);
  const prefsDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode: 'light' | 'dark' = mode === 'system' ? (prefsDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedMode;
    localStorage.setItem('theme', mode);
    if (themeInitialMount.current) { themeInitialMount.current = false; return; }
    setAnnouncement(`Theme changed to ${resolvedMode} mode`);
    setTimeout(() => setAnnouncement(''), 3000);
  }, [mode, resolvedMode]);

  const toggle = useCallback(() => setMode(m => (m === 'light' ? 'dark' : 'light')), []);

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggle }}>
      <span role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>{announcement}</span>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => React.useContext(ThemeContext);


interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const PERMISSIONS: Record<AuthUser['role'], string[]> = {
  admin:  ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const mockUser: AuthUser = {
      id: '1', name: 'Demo User', email, role: 'editor',
    };
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setIsLoading(false);
    setStatusMsg(`Signed in as ${mockUser.name}`);
    setTimeout(() => setStatusMsg(''), 3000);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    setStatusMsg('Signed out');
    setTimeout(() => setStatusMsg(''), 3000);
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, hasPermission }}>
      <span role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}>
        {isLoading ? 'Authentication in progress' : statusMsg}
      </span>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


type Nullable<T>     = T | null;
type Optional<T>     = T | undefined;
type ValueOf<T>      = T[keyof T];
type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
type NonEmptyArray<T> = [T, ...T[]];
type Awaited_<T>     = T extends Promise<infer U> ? U : T;
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never;
type PartialRecord<K extends keyof any, V> = Partial<Record<K, V>>;
type Mutable<T>      = { -readonly [P in keyof T]: T[P] };
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];


const { useMemo } = React;

export {
  Badge, Avatar, Tooltip, Accordion, Pagination, DataTable,
  ToastProvider, useToast, Combobox, Progress, Stepper,
  DatePicker, Rating, FileUpload, ColorPicker, Skeleton, CodeBlock, Slider,
  usePrevious, useOnClickOutside, useWindowSize, useMediaQuery,
  useEventListener, useInterval, useToggle, useCopyToClipboard,
  useScrollLock, useVirtualList,
  ThemeProvider, useTheme,
  AuthProvider, useAuth,
};