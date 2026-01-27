"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface AvatarSelectionStepProps {
  avatar: string | null;
  update: (data: { avatar: string }) => void;
}


export function AvatarSelectionStep({ avatar, update }: AvatarSelectionStepProps) {
  const presetAvatars = [
    "/setup/pf1.svg",
    "/setup/pf2.svg",
    "/setup/pf3.svg",
    "/setup/pf4.svg",
    "/setup/pf5.svg",
    "/setup/pf6.svg",
    "/setup/pf7.svg",
    "/setup/pf8.svg",
  ];

  const [selectedImage, setSelectedImage] = useState<string | null>(avatar);
  const [openCamera, setOpenCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

          {/*camera upload*/ }
    const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode:"user"} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera permission denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageUrl = canvas.toDataURL("image/png"); // create image url we'll use for upload

    setSelectedImage(imageUrl);
    update({ avatar: imageUrl });
    stopCamera();
    setOpenCamera(false);
  };

  useEffect(() => {
    if (openCamera) {
      startCamera();
    }
    return stopCamera;
  }, [openCamera]);


  
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[320px]">
      {/*  Avatar Preview */}
      <div className="mb-6 relative">
        <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-[#0B76FF] bg-white relative">
          <Image
            src={selectedImage || "/setup/profile.svg"}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mb-6 w-full max-w-sm justify-center">
        <Button
          type="button"
          className="flex-1 bg-[#0B76FF] hover:bg-[#0663d6] h-[45px] text-[16px] font-bold text-white"
          onClick={() => setOpenCamera(true)}
        >
          Camera
        </Button>

        <Button
          type="button"
          variant="outline"
          className="flex-1 border-[2px] border-[#0B76FF] text-[#0B76FF] h-[45px] text-[16px] font-bold"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Image
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert("Image must be less than 5MB");
              return;
            }

            const previewUrl = URL.createObjectURL(file);
            setSelectedImage(previewUrl);
            update({ avatar: previewUrl });
            e.target.value = "";
          }}
        />
      </div>

      {/*  Avatar Grid */}
      <div className="grid grid-cols-4 gap-6 mb-4">
        {presetAvatars.map((avatar, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {setSelectedImage(avatar); update({ avatar });}}
            className={`w-[60px] h-[60px] rounded-full overflow-hidden border-2 transition
              ${selectedImage === avatar ? "border-[#0B76FF]" : "border-transparent"}`}
          >
            <Image
              src={avatar}
              alt="Avatar"
              width={60}
              height={60}
              className="object-cover"
            />
          </button>
        ))}
      </div>

     {/*camera preview modal */ }
      {openCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blur/10 rounded-2xl">
          <div className="bg-white rounded-2xl p-6 w-[360px]">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Capture Photo
            </h3>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-2xl mb-4"
            />

            <canvas ref={canvasRef} hidden />

            <div className="flex gap-4">
              <Button className="flex-1 bg-[#0B76FF]" onClick={captureImage}>
                Capture
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  stopCamera();
                  setOpenCamera(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
