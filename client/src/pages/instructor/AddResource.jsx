import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateResourceMutation,
  useGetPublishedResourcesQuery,
} from "@/features/api/resourceApi";
import { toast } from "sonner";

const AddResource = () => {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const [type, setType] = useState("");

  const [createResource, { isLoading }] = useCreateResourceMutation();
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
          Resource Logo <span className="text-red-500">*</span>
        </label>
        <Input
          type="file"
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
        <div key={item._id} className="flex items-center gap-2">
          <img src={item.logo?.url} width={50} />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default AddResource;