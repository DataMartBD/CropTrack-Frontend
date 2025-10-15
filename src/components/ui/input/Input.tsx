import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-2.5 block font-medium text-black dark:text-white">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${className}`}
            {...props}
          />
        </div>
        {error && <span className="mt-1 text-sm text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;