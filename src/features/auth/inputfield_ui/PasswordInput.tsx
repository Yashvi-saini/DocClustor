import React from "react";
import FloatingInput from "./FloatingInput";

type PasswordInputProps = {
	name: string;
	label: string;
	disabled?: boolean;
	register?: ReturnType<any>;
	error?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	className?: string;
  maxLength?: number;
};

export default function PasswordInput(props: PasswordInputProps) {
	return (
		<FloatingInput
			name={props.name}
			label={props.label}
			type="password"
			disabled={props.disabled}
			register={props.register}
			error={props.error}
			value={props.value}
			onChange={props.onChange}
			onFocus={props.onFocus}
			onBlur={props.onBlur}
			className={props.className}
			showEyeToggle={true}
			autoComplete="new-password"
			spellCheck={false}
      maxLength={props.maxLength}
		/>
	);
}

