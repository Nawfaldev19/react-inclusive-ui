import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import { Field, type FieldProps } from "./Field";

export interface TextFieldProps extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, "required"> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, required, id, className, ...input },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(control) => <input ref={ref} className={cx("th-input", className)} {...input} {...control} />}
    </Field>
  );
});
