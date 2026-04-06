import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2, PlusCircle, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [resource, setResource] = useState("");
  const [domain, setDomain] = useState([]);

  const { data: resourceData } = useGetPublishedResourcesQuery();
  const { data: domainData } = useGetDomainsQuery();
  const [createCourse, { data, isLoading, isSuccess }] = useCreateCourseMutation();
  const navigate = useNavigate();

  const createCourseHandler = async () => {
    if (domain.length === 0 || resource === "" || courseTitle === "") {
      toast.error("Please fill in all the foundational fields.");
      return;
    }
    await createCourse({ courseTitle, resource, domain });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created successfully.");
      navigate("/instructor/course");
    }
  }, [isSuccess, data, navigate]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-teal-50 hover:text-teal-600 transition-all border-teal-100"
          onClick={() => navigate("/instructor/course")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="font-bold text-3xl text-gray-900 flex items-center gap-2">
            <PlusCircle className="text-teal-600" />
            New Case Study Setup
          </h1>
          {/* <p className="text-gray-500 mt-1 italic">Define the core attributes of your Case Study.</p> */}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 space-y-8">
        {/* Step 1: Identity */}
        <div className="space-y-4">
          <Label className="text-teal-700 font-bold uppercase tracking-wider text-[15px] flex items-center gap-2">
            Case Study Title<span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g. Supply Chain Modeling and Simulation"
            className="focus-visible:ring-teal-500 border-gray-200 h-12 text-lg font-medium"
          />
        </div>

        {/* Step 2: Categorization */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-teal-700 font-bold uppercase tracking-wider text-[15px]">Resource Type<span className="text-red-500">*</span></Label>
            <select
              value={resource}
              onChange={e => setResource(e.target.value)}
              className="w-full h-11 px-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all outline-none"
              required
            >
              <option value="">Select Resource Type</option>
              {resourceData?.resources?.map(res => (
                <option key={res._id} value={res._id}>{res.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <Label className="text-teal-700 font-bold uppercase tracking-wider text-[15px]">Primary Domain(can be multiple)<span className="text-red-500">*</span></Label>
            <div className="p-4 border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-gray-50/30 space-y-3 custom-scrollbar">
              {domainData?.domains?.map(dom => (
                <div key={dom._id} className="flex items-center gap-3 group">
                  <input
                    type="checkbox"
                    id={`dom-${dom._id}`}
                    checked={domain.includes(dom._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDomain([...domain, dom._id]);
                      } else {
                        setDomain(domain.filter(id => id !== dom._id));
                      }
                    }}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                  <label htmlFor={`dom-${dom._id}`} className="text-sm font-semibold text-gray-600 cursor-pointer group-hover:text-teal-700 transition-colors">
                    {dom.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/instructor/course`)}
            className="px-8 border-gray-200 hover:bg-gray-50 font-medium h-11"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={createCourseHandler}
            className="bg-teal-600 hover:bg-teal-700 text-white px-12 shadow-lg shadow-teal-100 font-bold h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
