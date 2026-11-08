import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
  /** Mixed state, e.g. a "select all" box when only some rows are selected. */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, id, ...input },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className="th-checkbox">
      <input
        ref={inner}
        id={inputId}
        type="checkbox"
        className="th-checkbox__input"
        aria-describedby={descriptionId}
        {...input}
      />
      <div>
        <label htmlFor={inputId} className="th-checkbox__label">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="th-field__hint">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
