"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Calendar, Edit2, Shield, Bell, Lock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "../../dashboard/context/DashboardContext";

export function ProfileView() {
    const { userProfile, updateUserProfile } = useDashboard();

    const presetAvatars = [
        "/setup/pf1.svg",
        "/setup/pf2.svg",
        "/setup/pf3.svg",
        "/setup/pf4.svg",
        "/setup/pf5.svg",
        "/setup/pf6.svg",
        "/setup/pf7.svg",
        "/setup/pf8.svg",
        "/yashvi-avatar.png",
        "/yashvi-anime-avatar.png",
    ];

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [avatar, setAvatar] = useState("");

    // Initialize edit fields when userProfile is loaded or when entering edit mode
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || "");
            setPhone(userProfile.phone || "");
            setDob(userProfile.dob || "");
            setAvatar(userProfile.avatar || "/setup/profile.svg");
        }
    }, [userProfile, isEditing]);

    const handleSave = async () => {
        const success = await updateUserProfile({
            name,
            phone,
            dob,
            avatar,
        });
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const info = {
        name: userProfile?.name || "User",
        email: userProfile?.email || "",
        phone: userProfile?.phone || "+91 98765 43210",
        dob: userProfile?.dob || "12 Oct 2002",
        location: "Chandigarh, India",
        avatar: userProfile?.avatar || "/yashvi-anime-avatar.png",
        role: userProfile?.role || "Individual Content Creator",
        joinedDate: userProfile?.joinedDate || "April 2024"
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-8 pb-10 font-poppins"
        >
            {/* Header / Hero Section */}
            <header className="relative group">
                <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-[#003259] via-[#0B76FF] to-[#4FF3D0] relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                    {/* Animated shapes in background */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#4FF3D0]/20 rounded-full blur-3xl"></div>
                </div>

                <div className="px-6 -mt-16 flex flex-col md:flex-row md:items-end gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                            <Image 
                                src={isEditing ? avatar : info.avatar} 
                                alt={info.name} 
                                fill 
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="absolute -bottom-2 -right-2 p-2 bg-[#0B76FF] text-white rounded-xl shadow-lg hover:bg-[#0050CC] transition-colors border-2 border-white"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 mb-2">
                        {isEditing ? (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-2xl font-bold text-[#003259] border-b border-gray-300 focus:border-[#0B76FF] outline-none bg-transparent w-full max-w-sm"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-[#003259]">{info.name}</h1>
                                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                                    <span className="px-3 py-1 bg-[#F0F8FF] text-[#0B76FF] rounded-full text-xs font-bold border border-[#0B76FF]/10 uppercase tracking-wider">
                                        {info.role}
                                    </span>
                                    <span className="text-sm">• Joined {info.joinedDate}</span>
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 mb-2">
                        {isEditing ? (
                            <>
                                <Button 
                                    onClick={handleSave}
                                    className="bg-[#4FF3D0] hover:bg-[#3ce0bd] text-[#003259] rounded-xl px-5 h-11 font-bold transition-all shadow-lg shadow-teal-500/20 gap-2"
                                >
                                    <Check size={16} /> Save
                                </Button>
                                <Button 
                                    onClick={handleCancel}
                                    variant="outline" 
                                    className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 font-bold px-5 h-11 gap-2"
                                >
                                    <X size={16} /> Cancel
                                </Button>
                            </>
                        ) : (
                            <Button 
                                onClick={() => setIsEditing(true)}
                                className="bg-[#0B76FF] hover:bg-[#0050CC] text-white rounded-xl px-6 h-11 font-semibold transition-all shadow-lg shadow-blue-500/20 gap-2"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Avatar Preset Grid visible only during editing */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-none shadow-sm rounded-3xl bg-white">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-bold text-[#003259] mb-4">Choose Avatar</h3>
                                <div className="flex flex-wrap gap-4">
                                    {presetAvatars.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setAvatar(preset)}
                                            className={`w-16 h-16 rounded-full overflow-hidden border-2 transition transform hover:scale-105 ${
                                                avatar === preset ? "border-[#0B76FF] ring-2 ring-[#0B76FF]/20" : "border-transparent"
                                            }`}
                                        >
                                            <Image
                                                src={preset}
                                                alt="Preset Avatar"
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-8">
                            <h2 className="text-xl font-bold text-[#003259] mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-[#0B76FF]" />
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                <InfoItem icon={<Mail />} label="Email Address" value={info.email} />
                                
                                {isEditing ? (
                                    <EditInfoItem 
                                        icon={<Phone />} 
                                        label="Phone Number" 
                                        value={phone} 
                                        onChange={setPhone} 
                                    />
                                ) : (
                                    <InfoItem icon={<Phone />} label="Phone Number" value={info.phone} />
                                )}

                                {isEditing ? (
                                    <EditInfoItem 
                                        icon={<Calendar />} 
                                        label="Date of Birth" 
                                        value={dob} 
                                        onChange={setDob} 
                                        type="date"
                                    />
                                ) : (
                                    <InfoItem icon={<Calendar />} label="Date of Birth" value={info.dob} />
                                )}

                                <InfoItem icon={<MapPin />} label="Location" value={info.location} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-8">
                            <h2 className="text-xl font-bold text-[#003259] mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-[#0B76FF]" />
                                Security Settings
                            </h2>
                            <div className="space-y-4">
                                <SecurityAction 
                                    title="Update Password" 
                                    description="Last changed 3 months ago" 
                                    buttonText="Change" 
                                />
                                <div className="h-px bg-gray-100 w-full"></div>
                                <SecurityAction 
                                    title="Two-Factor Authentication" 
                                    description="Secure your account with 2FA" 
                                    buttonText="Enable" 
                                    active={false}
                                />
                                <div className="h-px bg-gray-100 w-full"></div>
                                <SecurityAction 
                                    title="Locker PIN" 
                                    description="Change your 4-digit secure vault PIN" 
                                    buttonText="Update PIN" 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stats/Activity */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl bg-[#003259] text-white">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-4">Storage Usage</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-200">Used Space</span>
                                    <span className="font-bold">2.4 GB / 10 GB</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#4FF3D0] w-[24%] rounded-full shadow-[0_0_10px_rgba(79,243,208,0.5)]"></div>
                                </div>
                                <p className="text-xs text-blue-200/70 italic">
                                    You&apos;ve used 24% of your total storage capacity.
                                </p>
                                <Button className="w-full bg-[#1E9BFF] hover:bg-[#0076D6] text-white rounded-xl font-bold transition-all border-none">
                                    Upgrade Plan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-[#003259] mb-4 flex items-center gap-2">
                                <Bell size={18} className="text-[#0B76FF]" />
                                Notifications
                            </h3>
                            <div className="space-y-4">
                                <NotificationToggle label="System Updates" defaultChecked />
                                <NotificationToggle label="Security Alerts" defaultChecked />
                                <NotificationToggle label="Email Reports" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#F0F8FF] text-[#0B76FF] rounded-2xl shrink-0">
                {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-[#003259] font-bold break-all">{value}</p>
            </div>
        </div>
    );
}

function EditInfoItem({ icon, label, value, onChange, type = "text" }: { icon: React.ReactNode, label: string, value: string, onChange: (val: string) => void, type?: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#F0F8FF] text-[#0B76FF] rounded-2xl shrink-0">
                {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            </div>
            <div className="w-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="border-b border-gray-300 focus:border-[#0B76FF] outline-none text-[#003259] font-bold bg-transparent w-full py-0.5 text-sm"
                />
            </div>
        </div>
    );
}

function SecurityAction({ title, description, buttonText, active = true }: { title: string, description: string, buttonText: string, active?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="font-bold text-[#003259]">{title}</p>
                <p className="text-sm text-gray-500 font-medium">{description}</p>
            </div>
            <Button variant="outline" className="rounded-xl border-[#0B76FF]/20 text-[#0B76FF] hover:bg-[#F0F8FF] font-bold">
                {buttonText}
            </Button>
        </div>
    );
}

function NotificationToggle({ label, defaultChecked = false }: { label: string, defaultChecked?: boolean }) {
    const [checked, setChecked] = React.useState(defaultChecked);
    return (
        <div className="flex items-center justify-between font-poppins">
            <span className="text-sm font-bold text-gray-700">{label}</span>
            <button 
                onClick={() => setChecked(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[#0B76FF]' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
}
