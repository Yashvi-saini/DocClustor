"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { PhoneInput as ReactInternationalPhone } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    label?: string;
}

export function PhoneInput({ value, onChange, className, placeholder, label }: PhoneInputProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const [dialCode, setDialCode] = React.useState("+91");
    const hasValue = value && value.length > 3;

    return (
        <div className={cn("phone-input-container w-full relative", className)}>
            <div className="absolute left-[48px] top-0 h-full flex items-center gap-1 pointer-events-none z-10">
                <span className="text-sm text-gray-700">{dialCode}</span>
                <ChevronDown size={14} className="text-gray-500" />
            </div>

            <ReactInternationalPhone
                defaultCountry="in"
                value={value}
                onChange={(phone, meta: any) => {
                    onChange(phone);
                    if (meta?.country?.dialCode) {
                        setDialCode("+" + meta.country.dialCode);
                    }
                }}
                disableDialCodeAndPrefix={true}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !hasValue ? placeholder : ""}
                inputClassName="w-full !h-[45px] !text-[13px] !px-4 !rounded-md !border !border-[#999999] !bg-white focus:!border-[#0B76FF] placeholder:!text-[#999999] transition-colors outline-none box-border"
                countrySelectorStyleProps={{
                    buttonClassName: "!h-[45px] !w-[100px] !justify-start !pl-3 !rounded-md !border !border-[#999999] !bg-white hover:!bg-gray-50 focus-within:!border-[#0B76FF] transition-colors box-border"
                }}
                style={{
                    display: "flex",
                    height: "45px",
                    gap: "10px",
                    alignItems: "center",
                    width: "100%",
                }}
            />
            {label && (isFocused || hasValue) && (
                <label
                    className={cn(
                        "pointer-events-none absolute left-[120px] -top-2 text-xs transition-all px-1 bg-white",
                        isFocused ? "text-[#018FFF]" : "text-gray-500"
                    )}
                >
                    {label}
                </label>
            )}
            <style jsx global>{`
                .react-international-phone-country-selector-button__dropdown-arrow {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
