import React, { useState } from "react";
import Image from "next/image";

type FloatingInputProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  disabled?: boolean;
  register?: ReturnType<any>;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  showEyeToggle?: boolean; // only for password
  autoComplete?: string;
  spellCheck?: boolean;
  maxLength?: number;
};

export default function FloatingInput({
  name,
  label,
  type = "text",
  disabled = false,
  register,
  error,
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
  showEyeToggle = false,
  autoComplete,
  spellCheck,
  maxLength,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // password default to visible until we closes eye explicitly
  const [show, setShow] = useState(type === "password" ? true : false);
  const hasValue = (value ?? "").trim().length > 0;
  const isError = Boolean(error);

  const activeColor = "#018FFF";
  const errorColor = "#FF2121";
  const isValidWithValue = !isError && hasValue;
  const computedBorderColor = isError
    ? errorColor
    : isFocused
      ? activeColor
      : isValidWithValue
        ? activeColor
        : undefined;
  const computedLabelColor = isError
    ? errorColor
    : isFocused
      ? activeColor
      : isValidWithValue
        ? activeColor
        : undefined;

  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full">
        <input
          {...(register || {})}
          id={name}
          name={name}
          type={inputType}
          disabled={disabled}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          maxLength={maxLength}
          className={[
            "peer block w-full rounded-md",
            "border",
            "bg-white",
            "border-[#999999]",
            showEyeToggle ? "px-4 pt-3 pb-2 pr-11 text-[13px]" : "px-4 pt-3 pb-2 text-[13px]",
            showEyeToggle && type === "password" && !show
              ? "text-sm outline-none text-[#595959]"
              : "text-sm outline-none text-[#000000]",
            disabled ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          placeholder={!isFocused && !hasValue ? label : " "}
          value={value}
          onChange={(e) => {
            register?.onChange?.(e);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            register?.onBlur?.(e);
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{ borderColor: computedBorderColor }}
        />

        {showEyeToggle && type === "password" && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-[4px]"
          >
            <Image src={show ? "/eye.svg" : "/eyeoff.svg"} alt="toggle" width={20} height={20} />
          </button>
        )}

        {(isFocused || hasValue) && (
          <label
            htmlFor={name}
            className={[
              "pointer-events-none absolute left-4",
              "-top-2",
              "text-xs",
              "origin-left transition-all",
              isError ? "" : "text-gray-500",
              "px-1",
            ].join(" ")}
            style={{ backgroundColor: "#ffffff", color: computedLabelColor }}
          >
            {label}
          </label>
        )}
      </div>

      {isError ? <p className="mt-1 text-xs text-[#FF2121]">{error}</p> : null}
    </div>
  );
}
