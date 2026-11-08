import { forwardRef, type SelectHTMLAttributes } from "react";
import { Field, type FieldProps } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends FieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "required" | "children"> {
  options: readonly SelectOption[];
  /** Adds a first, unselectable option such as "Choose a category". */
  placeholder?: string;
}

/** A styled native select: keeps the platform's keyboard and screen reader support. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, id, options, placeholder, ...select },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(control) => (
        <select ref={ref} className="th-input th-select" {...select} {...control}>
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});
