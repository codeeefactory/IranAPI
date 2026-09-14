import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type FieldMeta = {
  label: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  fieldClassName?: string;
};

function FieldFrame({
  id,
  label,
  hint,
  error,
  required,
  fieldClassName,
  children,
}: FieldMeta & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={cn("form-field", fieldClassName)} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id} className="form-label">
        <span>{label}</span>
        {required ? <span className="form-required" aria-hidden>*</span> : null}
      </label>
      {children}
      {error ? <p id={`${id}-error`} className="form-error" role="alert">{error}</p> : null}
      {!error && hint ? <p id={`${id}-hint`} className="form-help">{hint}</p> : null}
    </div>
  );
}

type TextFieldProps = FieldMeta & InputHTMLAttributes<HTMLInputElement> & { action?: ReactNode };

export function TextField({ label, hint, error, icon: Icon, fieldClassName, action, className, id: suppliedId, ...props }: TextFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={props.required} fieldClassName={fieldClassName}>
      <div className={cn("form-control-wrap", fieldClassName)}>
        {Icon ? <Icon className="form-control-icon" aria-hidden /> : null}
        <input
          id={id}
          className={cn("field form-control", Icon && "form-control-with-icon", action && "form-control-with-action", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {action ? <div className="form-control-action">{action}</div> : null}
      </div>
    </FieldFrame>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, "type" | "action">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  const visibilityLabel = visible ? t("a11y.hidePassword") : t("a11y.showPassword");
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      action={(
        <button
          type="button"
          className="form-icon-button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visibilityLabel}
          title={visibilityLabel}
        >
          {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </button>
      )}
    />
  );
}

type SelectFieldProps = FieldMeta & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, hint, error, icon: Icon, fieldClassName, className, id: suppliedId, children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={props.required} fieldClassName={fieldClassName}>
      <div className={cn("form-control-wrap", fieldClassName)}>
        {Icon ? <Icon className="form-control-icon" aria-hidden /> : null}
        <select
          id={id}
          className={cn("field form-control form-select", Icon && "form-control-with-icon", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="form-select-icon" aria-hidden />
      </div>
    </FieldFrame>
  );
}

type TextAreaFieldProps = FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, hint, error, icon: Icon, fieldClassName, className, id: suppliedId, ...props }: TextAreaFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={props.required} fieldClassName={fieldClassName}>
      <div className={cn("form-control-wrap form-textarea-wrap", fieldClassName)}>
        {Icon ? <Icon className="form-control-icon form-textarea-icon" aria-hidden /> : null}
        <textarea
          id={id}
          className={cn("field form-control form-textarea", Icon && "form-control-with-icon", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
      </div>
    </FieldFrame>
  );
}

export function CheckboxField({ id, label, checked, onChange, disabled }: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="form-check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} />
      <span className="form-check-box"><CheckCircle2 aria-hidden /></span>
      <span>{label}</span>
    </label>
  );
}

export function FormStatus({ tone, children, className }: { tone: "error" | "success"; children: ReactNode; className?: string }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={cn("form-status", className)} data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <Icon aria-hidden />
      <div className="min-w-0 flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
