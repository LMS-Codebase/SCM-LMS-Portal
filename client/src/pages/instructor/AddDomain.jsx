import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDomainMutation, useGetDomainsQuery } from "@/features/api/domainApi";
import { toast } from "sonner";

const AddDomain = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  const [createDomain, { isLoading }] = useCreateDomainMutation();
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
          Domain Logo <span className="text-red-500">*</span>
        </label>
        <Input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <Button onClick={handleSubmit} disabled={isLoading}>
        Add Domain
      </Button>

      {/* LIST BELOW */}
      {data?.domains?.map((item) => (
        <div key={item._id} style={{ marginTop: 16 }}>
          {item.image?.url && (
            <img src={item.image.url} width={50} alt={item.name} />
          )}
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default AddDomain;
