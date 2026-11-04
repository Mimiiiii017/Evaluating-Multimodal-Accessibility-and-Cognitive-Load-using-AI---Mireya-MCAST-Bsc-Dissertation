/**
 * Study 6: TSX Medium-Complexity Fixture (~495 kB) — 30 Accessibility Errors
 * 
 * React/TSX accessibility errors include:
 *   • Missing ARIA attributes on custom components
 *   • State changes without announcements
 *   • Incorrect component roles
 *   • Missing key attributes for dynamic lists
 *   • Uncontrolled dynamic focus
 *   • Custom components without semantic HTML
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── ERROR 1-3: Custom Button Component ───
const CustomButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', padding: '8px' }}>
      {/* ERROR 1: div used instead of button; no role */}
      {/* ERROR 2: No keyboard support (not focusable) */}
      {/* ERROR 3: No aria-label or accessible name */}
      {children}
    </div>
  );
};

// ─── Navigation Component (Errors 4-8) ───
interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

const Navigation: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      <button onClick={() => setIsOpen(!isOpen)}>
        {/* ERROR 4: aria-expanded not set */}
        {/* ERROR 5: aria-haspopup not set */}
        Menu
      </button>
      {isOpen && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {/* ERROR 6: Missing index keys are anti-pattern but used as fallback */}
              <a href={item.href}>
                {item.icon && <span>{item.icon}</span>}
                {/* ERROR 7: Icon span has no alt or aria-label */}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {/* ERROR 8: No announcement when menu opens/closes */}
    </nav>
  );
};

// ─── Tab Component (Errors 9-12) ───
interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

const Tabs: React.FC<{ tabs: TabItem[] }> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={index === activeTab}
            {/* ERROR 9: aria-controls not set */}
            {/* ERROR 10: onClick handler exists but no keyboard handler for Arrow keys */}
            onClick={() => setActiveTab(index)}
            tabIndex={index === activeTab ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          {/* ERROR 11: aria-labelledby ID doesn't match button ID */}
          style={{ display: index === activeTab ? 'block' : 'none' }}
          {/* ERROR 12: using display:none hides from all users; visibility or separate render better */}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

// ─── Form Component (Errors 13-18) ───
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
}

const Form: React.FC<{ fields: FormField[]; onSubmit: (data: any) => void }> = ({
  fields,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // ERROR 13: No real-time validation feedback or aria-live announcements
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
        // ERROR 14: Error message not associated via aria-describedby
      }
    });

    setErrors(newErrors);
    // ERROR 15: Error count not announced
    // ERROR 16: Focus not moved to first error field

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              {/* ERROR 17: aria-invalid not set based on errors state */}
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              {/* ERROR 18: No aria-required when required is true (redundant but helpful) */}
            />
          )}
          {errors[field.name] && (
            <span style={{ color: 'red' }}>
              {/* ERROR (linked to 14): Not linked to input via aria-describedby */}
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

// ─── Modal Component (Errors 19-22) ───
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // ERROR 19: Focus not trapped in modal
    // ERROR 20: Escape key handler not implemented
    // ERROR 21: Backdrop click should close modal but no handler

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // onClose(); // This is missing!
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* ERROR 22: No backdrop or overlay to visually indicate modal state */}
      <div ref={modalRef} role="dialog" aria-labelledby="modal-title">
        {/* ERROR 19 (cont): No aria-modal="true" */}
        {/* ERROR 20 (cont): No keyboard trap */}
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// ─── Dropdown/Select Component (Errors 23-25) ───
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
    // ERROR 23: No announcement of selection
  };

  return (
    <div ref={dropdownRef}>
      {label && <label>{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        {/* ERROR 24: aria-expanded not set */}
        {/* ERROR 25: aria-controls not set to listbox ID */}
      >
        {options.find(opt => opt.value === selectedValue)?.label || 'Select'}
      </button>
      {isOpen && (
        <ul role="listbox">
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              onClick={() => handleSelect(option.value)}
              {/* Missing aria-selected */}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── List Component (Errors 26-28) ───
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
          {/* ERROR 26: No semantic structure within list items */}
          <div>{item.title}</div>
          {/* ERROR 27: Descriptions not marked as such */}
          <div>{item.description}</div>
        </li>
      ))}
    </ul>
  );
};

// ─── Loading Indicator Component (ERROR 29) ───
const LoadingSpinner: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      style={{
        animation: 'spin 1s linear infinite',
        width: '24px',
        height: '24px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #3498db',
        borderRadius: '50%',
      }}
      {/* ERROR 29: No aria-live or role announcement; hidden from screen readers */}
      {/* ERROR 28: Animation doesn't respect prefers-reduced-motion */}
    />
  );
};

// ─── Alert Component (ERROR 30) ───
interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onDismiss }) => {
  return (
    <div
      role="alert"
      style={{
        padding: '12px',
        color: type === 'error' ? 'red' : 'blue',
        background: type === 'error' ? '#ffe0e0' : '#e0e0ff',
      }}
      {/* ERROR 30: No aria-live="assertive" for urgent alerts */}
    >
      {message}
      {onDismiss && (
        <button onClick={onDismiss}>Dismiss</button>
        {/* No keyboard way to dismiss via Escape */}
      )}
    </div>
  );
};

// ─── Main App Component ───
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
      <header>
        <h1>Study 6 App</h1>
        <Navigation items={navItems} />
      </header>

      <main>
        <section>
          <h2>Welcome</h2>
          <Tabs tabs={tabs} />
        </section>

        <section>
          <h2>Contact Us</h2>
          <Form
            fields={formFields}
            onSubmit={data => console.log('Form submitted:', data)}
          />
        </section>

        <section>
          <h2>Filter Products</h2>
          <Dropdown
            label="Category"
            options={dropdownOptions}
            onChange={value => console.log('Selected:', value)}
          />
        </section>

        <section>
          <h2>Products</h2>
          <List items={listItems} />
          <button onClick={() => setShowCart(!showCart)}>
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

// ─── PADDING FOR FILE SIZE (~495 KB) ───
// React utilities and hooks (unused but present in bundle)

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

// Dummy TypeScript types (padding)
type Primitive = string | number | boolean | null | undefined;
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// Additional component exports
export { CustomButton, Navigation, Tabs, Form, Dropdown, Modal, List, LoadingSpinner, Alert };
