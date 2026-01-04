"use client";

import React, { useEffect, useRef, useState } from "react";

type OtpInputProps = {
	length?: number; // we have 6 digits by default
	onChange?: (code: string) => void;
	onComplete?: (code: string) => void;
	error?: string | null; // for error message
	isVerifying?: boolean; // verify button clicked
	className?: string;
};

export default function OtpInput({ length = 6, onChange, onComplete, error, isVerifying = false, className = "" }: OtpInputProps) {
	const [values, setValues] = useState<string[]>(Array(length).fill(""));
	const [active, setActive] = useState<number>(0);
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

	useEffect(() => {
		inputsRef.current[0]?.focus();
	}, []);

	const setChar = (idx: number, ch: string) => {
		if (!/^[0-9]?$/.test(ch)) return;
		const copy = [...values];
		copy[idx] = ch;
		setValues(copy);

		const code = copy.join("");
		onChange?.(code);
		if (copy.every((v) => v !== "")) {
			onComplete?.(code);
		}

		if (ch && idx < length - 1) {
			inputsRef.current[idx + 1]?.focus();
			setActive(idx + 1);
		}
	};

	const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace") {
			if (values[idx]) {
				setChar(idx, "");
			} else if (idx > 0) {
				inputsRef.current[idx - 1]?.focus();
				setActive(idx - 1);
			}
		}
		if (e.key === "ArrowLeft" && idx > 0) {
			inputsRef.current[idx - 1]?.focus();
			setActive(idx - 1);
		}
		if (e.key === "ArrowRight" && idx < length - 1) {
			inputsRef.current[idx + 1]?.focus();
			setActive(idx + 1);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => {
		e.preventDefault();
		const pastedStr = e.clipboardData.getData("text").replace(/\D/g, "");
		if (!pastedStr) return;

		const nextValues = [...values];

		let start = idx;
		if (pastedStr.length === length) start = 0;
		const chars = pastedStr.split("");
		let lastChangedIndex = start;

		chars.forEach((char, i) => {
			const pos = start + i;
			if (pos < length) {
				nextValues[pos] = char;
				lastChangedIndex = pos;
			}
		});

		setValues(nextValues);
		
		const code = nextValues.join("");
		onChange?.(code);
		if (nextValues.every((v) => v !== "")) {
			onComplete?.(code);
		}

		const nextFocus = Math.min(lastChangedIndex + 1, length - 1);
		setActive(nextFocus);
		inputsRef.current[nextFocus]?.focus();
	};

	const activeBlue = "#018FFF";
	const errorRed = "#FF2121";
	const successGreen = "#00C896";

	return (
		<div className={`w-full flex items-center justify-between gap-1 sm:gap-[10px] md:gap-[16px] ${className}`}>
			{Array.from({ length }).map((_, i) => {
				const isActive = active === i;
				const hasVal = values[i] !== "";
				const allFilled = values.every((v) => v !== "");
				const allEmpty = values.every((v) => v === "");
				const showError = !allEmpty && !!error;
				const bottomShadow = showError
					? `0 4px 0 0 ${errorRed}`
					: allFilled
						? `0 4px 0 0 ${successGreen}`
						: isActive || hasVal
							? `0 4px 0 0 ${activeBlue}`
							: "none";

				return (
					<input
						key={i}
						ref={(el) => {
							inputsRef.current[i] = el;
						}}
						value={values[i]}
						onChange={(e) => setChar(i, e.target.value.slice(-1))}
						onKeyDown={(e) => onKeyDown(i, e)}
						onPaste={(e) => handlePaste(e, i)}
						onFocus={() => setActive(i)}
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={1}
						className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] rounded-[10px] md:rounded-[15px] text-center text-[18px] md:text-[24px] font-[700] text-[#000] outline-none bg-[#D9EEFF]"
						style={{
							border: "none",
							boxShadow: isActive || hasVal || allFilled || showError ? `0 4px 0 0 ${showError ? errorRed : allFilled ? successGreen : activeBlue}` : 'none',
						}}
					/>
				);
			})}
		</div>
	);
}

//  resend timer hook + button
export function ResendOtpButton({
	seconds = 30,
	onResend,
	startKey,
	disabledBeforeStart = false,
	onCountdownEnd,
}: {
	seconds?: number;
	onResend: () => void;
	startKey?: number | null;
	disabledBeforeStart?: boolean;
	onCountdownEnd?: () => void;
}) {
	// Defer countdown until explicitly started by startKey
	const [remaining, setRemaining] = useState(0);
	const [started, setStarted] = useState(!disabledBeforeStart);

	useEffect(() => {
		if (remaining <= 0) return;
		const id = setInterval(() => setRemaining((s) => s - 1), 1000);
		return () => clearInterval(id);
	}, [remaining]);

	useEffect(() => {
		if (startKey) {
			setStarted(true);
			setRemaining(seconds);
		}
	}, [startKey, seconds]);

	const start = () => {
		setStarted(true);
		setRemaining(seconds);
	};
	const clickable = started && remaining === 0;

	//  re-enabling verify button after countdown
	useEffect(() => {
		if (started && remaining === 0) {
			onCountdownEnd?.();
		}
	}, [remaining, started, onCountdownEnd]);

	return (
		<button
			type="button"
			disabled={!clickable}
			onClick={() => {
				onResend();
				start();
			}}
			className={`w-full text-[14px] font-[500] text-right md:text-center md:text-[18px] md:font-[700] md:h-[50px] md:rounded-[10px] md:border transition-colors ${clickable
				? "text-[#0B76FF] md:bg-white md:border-[#0B76FF] md:hover:bg-[#F5F9FF]"
				: "text-[#737373] md:bg-white md:border-[#737373]"
				}`}
		>
			{clickable ? "Resend OTP" : started && remaining > 0 ? `${remaining} sec to Resend OTP` : "Resend OTP"}
		</button>
	);
}
