import React, { useState, useRef, useEffect, useCallback } from 'react';

const CustomButton: React.FC<{ onClick: () => void; children: React.ReactNode; label?: string }> = ({
  onClick,
  children,
  label
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="custom-button"
    >
      {children}
    </button>
  );
};

interface NavItem {
  label: string;
  href: string;
}

const Navigation: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const announcer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcer.current) {
      announcer.current.textContent = isOpen ? 'Navigation menu opened' : 'Navigation menu closed';
    }
  }, [isOpen]);

  return (
    <nav>
      <div ref={announcer} aria-live="polite" className="sr-only"></div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle main menu"
        aria-haspopup="menu"
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item) => (
            <li key={item.href} role="none">
              <a href={item.href} role="menuitem">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

const Tabs: React.FC<{ tabs: TabItem[] }> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = index === 0 ? tabs.length - 1 : index - 1;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = index === tabs.length - 1 ? 0 : index + 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    
    handleTabChange(newIndex);
    const tabList = tabListRef.current;
    if (tabList) {
      const buttons = tabList.querySelectorAll('[role="tab"]');
      (buttons[newIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" ref={tabListRef}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeTab}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeTab ? 0 : -1}
            onClick={() => handleTabChange(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeTab}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errorRegion = useRef<HTMLDivElement>(null);
  const firstErrorRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      const field = fields.find(f => f.name === name);
      if (field?.required && !value.trim()) {
        newErrors[name] = 'This field is required';
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    let firstInvalidField: HTMLInputElement | null = null;

    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = 'This field is required';
        if (!firstInvalidField) {
          firstInvalidField = document.getElementById(field.name) as HTMLInputElement;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (errorRegion.current) {
        errorRegion.current.textContent = `Form has ${Object.keys(newErrors).length} error(s). Please correct them.`;
      }
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    if (errorRegion.current) {
      errorRegion.current.textContent = 'FormSubmitted successfully';
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div ref={errorRegion} role="alert" aria-live="assertive" className="sr-only"></div>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name}>
            {field.label}
            {field.required && <span aria-label="required"> *</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              required={field.required}
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              required={field.required}
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
            />
          )}
          {errors[field.name] && (
            <span id={`error-${field.name}`} style={{ color: 'red' }} role="alert">
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [previousActiveElement, setPreviousActiveElement] = useState<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviousActiveElement(document.activeElement);
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
        if (previousActiveElement instanceof HTMLElement) {
          previousActiveElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, previousActiveElement]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          minWidth: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef}>
      {label && <label>{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="listbox"
      >
        {options.find(opt => opt.value === selectedValue)?.label || 'Select'}
      </button>
      {isOpen && (
        <ul role="listbox" id="listbox">
          {options.map(option => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === selectedValue}
              onClick={() => handleSelect(option.value)}
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
          <h4>{item.title}</h4>
          {item.description && <p>{item.description}</p>}
        </li>
      ))}
    </ul>
  );
};

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
      role="status"
      aria-label="Loading"
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
      role="alert"
      aria-live="assertive"
      style={{
        padding: '12px',
        color: type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#004085',
        background: type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1',
        borderRadius: '4px',
        border: `1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'}`,
      }}
    >
      {message}
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss alert">
          ✕
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [showCart, setShowCart] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', content: <div>About our company and mission</div> },
    { id: 'details', label: 'Details', content: <div>Detailed information about our services</div> },
    { id: 'reviews', label: 'Reviews', content: <div>Customer feedback and testimonials</div> },
  ];

  const formFields: FormField[] = [
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
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
      <Navigation items={navItems} />
      <main>
        <h1>Welcome</h1>
        <Tabs tabs={tabs} />
        <Form fields={formFields} onSubmit={(data) => console.log(data)} />
        <Dropdown options={dropdownOptions} onChange={(val) => console.log(val)} label="Filter by category" />
        <List items={listItems} />
        <LoadingSpinner isLoading={false} />
        <Alert message="Everything is working properly" type="success" />
        <button onClick={() => setShowModal(true)}>Open Modal</button>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Modal Dialog">
          <p>This is a fully accessible modal dialog.</p>
        </Modal>
      </main>
    </div>
  );
};

export default App;
export { CustomButton, Navigation, Tabs, Form, Dropdown, Modal, List, LoadingSpinner, Alert };
