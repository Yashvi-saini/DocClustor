import React from "react";
import FloatingInput from "./FloatingInput";

type IdentifierInputProps = {
	name: string;
	label: string;
	type?: "text" | "email";
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

export default function IdentifierInput(props: IdentifierInputProps) {
	return (
		<FloatingInput
			name={props.name}
			label={props.label}
			type={props.type ?? "text"}
			disabled={props.disabled}
			register={props.register}
			error={props.error}
			value={props.value}
			onChange={props.onChange}
			onFocus={props.onFocus}
			onBlur={props.onBlur}
			className={props.className}
			showEyeToggle={false}
			autoComplete="off"
			spellCheck={false}
      maxLength={props.maxLength}
		/>
	);
}

