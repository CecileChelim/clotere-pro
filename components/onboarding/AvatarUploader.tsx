"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Merci de choisir une image (JPG, PNG...).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image trop lourde (4 Mo maximum).");
      return;
    }

    setError(null);
    setUploading(true);

    const supabase = createClient();
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("L'envoi a échoué. Réessayez dans un instant.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gold-2">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Photo de profil" className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-outline px-4 py-2 text-xs"
        >
          {uploading ? "Envoi..." : value ? "Changer la photo" : "Ajouter une photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
