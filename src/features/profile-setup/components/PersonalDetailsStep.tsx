"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PhoneInput } from "@/components/ui/phone-input";
import FloatingInput from "@/features/auth/inputfield_ui/FloatingInput";

interface PersonalDetailsProps {
    data: {
        fullName: string;
        phone: string;
        dob: string;
    };
    update: (data: any) => void;
}

export function PersonalDetailsStep({ data, update }: PersonalDetailsProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        data.dob ? new Date(data.dob) : undefined
    );
    const [isDobOpen, setIsDobOpen] = React.useState(false);

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            update({ dob: format(newDate, "yyyy-MM-dd") });
        } else {
            update({ dob: "" });
        }
        setIsDobOpen(false);
    };

    return (
        <div className="w-full space-y-6 px-4 sm:px-10 py-4 min-h-[320px] flex flex-col justify-center">

            {/* Selected Avatar */}
            <div className="flex justify-center">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-[#0B76FF] bg-white flex items-center justify-center relative">
                    <Image
                        src="/setup/profile.svg"
                        alt="Selected Avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Name */}
            <div>
                <FloatingInput
                    name="fullName"
                    label="Enter Name"
                    value={data.fullName}
                    onChange={(e) => update({ fullName: e.target.value })}
                />
            </div>

            {/* Phone */}
            <div>
                <PhoneInput
                    value={data.phone}
                    onChange={(val) => update({ phone: val || "" })}
                    placeholder="Enter Phone Number"
                    label="Enter Phone Number"
                />
            </div>

            {/* DOB Date Picker */}
            <div className="relative w-full">
                <Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "w-full h-[45px] px-4 rounded-md border border-[#999999] flex items-center justify-between text-left transition-colors bg-white text-[13px] outline-none",
                                isDobOpen || date ? "border-[#018FFF]" : "border-[#999999]",
                                !date && "text-[#999]",
                                date && "text-[#000]"
                            )}
                        >
                            {date ? format(date, "dd/MM/yyyy") : (isDobOpen ? "" : <span>Pick a date of birth</span>)}
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    {/* Label for DOB */}
                    {(isDobOpen || date) && (
                        <label className={cn("pointer-events-none absolute left-4 -top-2 text-xs transition-all px-1 bg-white",
                             isDobOpen || date ? "text-[#018FFF]" : "text-gray-500"
                            )}
                        >
                            Enter DOB
                        </label>
                    )}
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1960}
                            toYear={2030}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
