import { useId, type ReactNode } from "react";

export interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
}

interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
}

/**
 * Lays out a label, a control, a hint, and an error, and wires their ids so
 * the control's accessible description is "error, then hint".
 */
export function Field({
  label,
  hint,
  error,
  required,
  id,
  children,
}: FieldProps & { id?: string; children: (control: FieldControlProps) => ReactNode }) {
  const generated = useId();
  const controlId = id ?? generated;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="th-field">
      <label className="th-field__label" htmlFor={controlId}>
        {label}
        {required && (
          <span className="th-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({ id: controlId, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {error && (
        <p id={errorId} className="th-field__error">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="th-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
