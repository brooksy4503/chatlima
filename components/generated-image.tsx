"use client";

import { motion } from "framer-motion";
import { ImageModal } from "./image-modal";
import { useState } from "react";

interface GeneratedImageProps {
  url: string;
  alt?: string;
}

export function GeneratedImage({ url, alt = "Generated image" }: GeneratedImageProps) {
  const [selected, setSelected] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col gap-2 w-full max-w-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="message-image rounded-xl border border-border/50 cursor-pointer"
          loading="lazy"
          onClick={() => setSelected(true)}
        />
        <div className="text-xs text-muted-foreground">AI-generated image · Click to expand</div>
      </motion.div>
      {selected && (
        <ImageModal
          isOpen={selected}
          onClose={() => setSelected(false)}
          imageUrl={url}
          metadata={{ filename: "generated-image.png", mimeType: "image/png" }}
        />
      )}
    </>
  );
}
