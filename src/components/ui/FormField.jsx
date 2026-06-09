import React, { useId } from 'react';

const FormField = ({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
  htmlFor,
}) => {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const describedBy = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const child = React.Children.only(children);
  const childProps = {
    id: child.props.id || fieldId,
    'aria-describedby': describedBy,
    ...(error ? { error: true } : {}),
  };
  const cloned = React.cloneElement(child, childProps);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {cloned}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
