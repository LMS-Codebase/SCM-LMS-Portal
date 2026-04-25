import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateDomainMutation,
  useGetDomainsQuery,
  useUpdateDomainThumbnailMutation,
} from "@/features/api/domainApi";
import { toast } from "sonner";
import { getFallbackImageUrl, getPublicImageUrl } from "@/lib/mediaUrl";

const AddDomain = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  const [createDomain, { isLoading }] = useCreateDomainMutation();
  const [updateDomainThumbnail] = useUpdateDomainThumbnailMutation();
  const { data } = useGetDomainsQuery();

  const handleSubmit = async () => {

    if (!name || !image) {
      toast.error("All fields are required")
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("logo", image); // backend expects 'logo' as field name

    try {
      const res = await createDomain(formData).unwrap();
      toast.success(res.message || "Domain created successfully");
      setName("");
      setImage(null);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const handleThumbnailUpdate = async (domainId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setUpdatingId(domainId);
      const res = await updateDomainThumbnail({ domainId, formData }).unwrap();
      toast.success(res.message || "Domain thumbnail updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update domain thumbnail");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-4">

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Domain Name <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Domain Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Domain Thumbnail <span className="text-red-500">*</span>
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <Button onClick={handleSubmit} disabled={isLoading}>
        Add Domain
      </Button>

      {/* LIST BELOW */}
      {data?.domains?.map((item) => (
        <div key={item._id} className="mt-4 flex items-center gap-4 rounded-lg border p-3">
          {item.image?.url && (
            <img
              src={getPublicImageUrl(item.image.url)}
              width={50}
              height={50}
              alt={item.name}
              className="rounded object-cover"
              onError={(e) => {
                const fallbackUrl = getFallbackImageUrl(item.image.url);
                if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                  e.currentTarget.src = fallbackUrl;
                }
              }}
            />
          )}
          <div className="flex-1 font-medium">{item.name}</div>
          <Input
            type="file"
            accept="image/*"
            className="max-w-[220px]"
            disabled={updatingId === item._id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleThumbnailUpdate(item._id, file);
              e.target.value = "";
            }}
          />
          <span className="min-w-[90px] text-xs text-gray-500">
            {updatingId === item._id ? "Updating..." : "Change image"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AddDomain;
