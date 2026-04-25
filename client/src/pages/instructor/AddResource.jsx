import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateResourceMutation,
  useGetPublishedResourcesQuery,
  useUpdateResourceThumbnailMutation,
} from "@/features/api/resourceApi";
import { toast } from "sonner";
import { getFallbackImageUrl, getPublicImageUrl } from "@/lib/mediaUrl";

const AddResource = () => {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const [type, setType] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [createResource, { isLoading }] = useCreateResourceMutation();
  const [updateResourceThumbnail] = useUpdateResourceThumbnailMutation();
  const { data } = useGetPublishedResourcesQuery();

  const handleSubmit = async () => {
    // ✅ FRONTEND VALIDATION
    if (!name || !logo || !type) {
      toast.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("logo", logo);
    formData.append("type", type);

    try {
      const res = await createResource(formData).unwrap();

      toast.success(res.message || "Resource created successfully");

      // ✅ Reset form
      setName("");
      setLogo(null);
      setType("");
    } catch (error) {
      toast.error(
        error?.data?.message || "Something went wrong"
      );
    }
  };

  const handleThumbnailUpdate = async (resourceId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setUpdatingId(resourceId);
      const res = await updateResourceThumbnail({ resourceId, formData }).unwrap();
      toast.success(res.message || "Resource thumbnail updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update resource thumbnail");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Resource Name <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Resource Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Resource Thumbnail <span className="text-red-500">*</span>
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setLogo(e.target.files[0])}
        />
      </div>


      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Resource Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-md border border-gray-300 p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="case-study">Case Study</option>
          <option value="ebook">E-Book</option>
          <option value="blog">Blog</option>
          <option value="course">Course</option>
        </select>
      </div>

      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Resource"}
      </Button>

      {/* LIST */}
      {data?.resources?.map((item) => (
        <div key={item._id} className="flex items-center gap-4 rounded-lg border p-3">
          <img
            src={getPublicImageUrl(item.logo?.url)}
            width={50}
            height={50}
            alt={item.name}
            className="rounded object-cover"
            onError={(e) => {
              const fallbackUrl = getFallbackImageUrl(item.logo?.url);
              if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                e.currentTarget.src = fallbackUrl;
              }
            }}
          />
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-gray-500 uppercase">Type: {item.type}</p>
          </div>
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

export default AddResource;
