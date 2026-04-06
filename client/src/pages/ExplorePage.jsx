import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import Course from "@/pages/student/Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";
import { useGetPublishedEbooksQuery } from "@/features/api/ebookApi";

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const { data: ebookData, isLoading: isEbookLoading } = useGetPublishedEbooksQuery();
  const { data: resourceData } = useGetPublishedResourcesQuery();
  const { data: domainData } = useGetDomainsQuery();

  // Populate filters from query parameters (URL)
  useEffect(() => {
    const domainQuery = searchParams.get("domain");
    const resourceQuery = searchParams.get("resource");

    if (domainQuery || resourceQuery) {
      setFilters(prev => {
        const foundDomain = domainData?.domains?.find(d => d.name?.toLowerCase() === domainQuery?.toLowerCase());
        const foundResource = resourceData?.resources?.find(r => r.name?.toLowerCase() === resourceQuery?.toLowerCase());

        return {
          ...prev,
          // If query exists, try to find ID. If not found yet (loading), keep prev to try again.
          // If query is NULL, reset to empty array for a "specific" navigation.
          domains: domainQuery ? (foundDomain ? [foundDomain._id] : prev.domains) : [],
          resources: resourceQuery ? (foundResource ? [foundResource._id] : prev.resources) : [],
        };
      });
    }
  }, [searchParams, domainData, resourceData]);



  /* ---------------- FILTER STATE ---------------- */

  const [filters, setFilters] = useState({
    resources: [],
    domains: [],
    levels: [],
    authors: [],
    priceRange: "",
  });

  // mobile filter
  const [showMobileFilters, setShowMobileFilters] = useState(false);



  /* ---------------- FILTER HANDLERS ---------------- */

  const toggleResource = (resourceId) => {
    setFilters((prev) => ({
      ...prev,
      resources: prev.resources.includes(resourceId)
        ? prev.resources.filter((r) => r !== resourceId)
        : [...prev.resources, resourceId],
    }));
  };

  const toggleDomain = (domainId) => {
    setFilters((prev) => ({
      ...prev,
      domains: prev.domains.includes(domainId)
        ? prev.domains.filter((d) => d !== domainId)
        : [...prev.domains, domainId],
    }));
  };

  const toggleLevel = (level) => {
    setFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const setPriceRange = (range) => {
    setFilters((prev) => ({ ...prev, priceRange: prev.priceRange === range ? "" : range }));
  };

  const toggleAuthor = (authorName) => {
    setFilters((prev) => ({
      ...prev,
      authors: prev.authors.includes(authorName)
        ? prev.authors.filter((a) => a !== authorName)
        : [...prev.authors, authorName],
    }));
  };

  /* ---------------- FILTER LOGIC (UNCHANGED) ---------------- */

  const authorsList = useMemo(() => {
    let courses = data?.courses || [];
    let ebooks = ebookData?.ebooks || [];
    const names = new Set();
    courses.forEach(c => { if (c.creator?.name) names.add(c.creator.name) });
    ebooks.forEach(e => { if (e.authorName) names.add(e.authorName) });
    return Array.from(names).sort();
  }, [data, ebookData]);

  const filteredData = useMemo(() => {
    let courses = data?.courses ? [...data.courses] : [];
    let ebooks = ebookData?.ebooks ? ebookData.ebooks.map(eb => ({
      ...eb,
      isEbook: true,
      // Map ebook fields to course fields for the UI card if needed
      courseTitle: eb.title,
      courseThumbnail: eb.thumbnail,
      coursePrice: eb.price,
      courseLevel: "E-Book",
      // We keep the actual creator (populated) so we have photoUrl
      // But we can specify instructorName as eb.authorName in the card directly 
      subTitle: eb.description,
      resource: resourceData?.resources?.find(r => r.name?.toLowerCase() === "ebook" || r.name?.toLowerCase() === "e-book")
    })) : [];

    const allItems = [...courses, ...ebooks];

    return allItems.filter((item) => {
      // Resource Filter
      if (filters.resources.length > 0) {
        const resId = item.resource?._id || item.resource;
        if (!filters.resources.includes(resId)) return false;
      }

      // Author Filter
      if (filters.authors.length > 0) {
        const mappedAuthorName = item.isEbook ? item.authorName : item.creator?.name;
        if (!mappedAuthorName || !filters.authors.includes(mappedAuthorName)) return false;
      }

      // Domain Filter - Multi Match Support
      // Ebooks currently don't have domain field in the model, but we could add it.
      // For now, if filtered by domain, ebooks won't show unless we add domain to them.
      if (filters.domains.length > 0) {
        if (item.isEbook) return false; // Hide ebooks if domain filter is active for now
        const courseDomains = Array.isArray(item.domain) ? item.domain : (item.domain ? [item.domain] : []);
        const hasMatch = courseDomains.some(d => {
          const domId = d?._id || d;
          return filters.domains.includes(domId);
        });
        if (!hasMatch) return false;
      }

      // Level Filter
      if (filters.levels.length > 0) {
        if (item.isEbook) {
          if (!filters.levels.includes("E-Book")) return false;
        } else if (!filters.levels.includes(item.courseLevel)) {
          return false;
        }
      }

      // Price Filter
      const price = item.isEbook ? item.price : item.coursePrice;
      if (filters.priceRange) {
        if (filters.priceRange === "free") {
          return price === 0;
        }
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      }
      return true;
    });
  }, [data, ebookData, filters, resourceData]);

  if (isLoading || isEbookLoading) return <p className="text-center mt-20 text-lg font-medium text-teal-600">Loading resources...</p>;
  if (isError) return <div className="text-center mt-20 text-red-500 font-semibold text-lg italic">Failed to fetch courses. Please try again later.</div>;

  /* ---------------- FILTER UI ---------------- */

  const FilterContent = () => (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-2 font-semibold text-gray-800 border-b pb-2">
        <Filter size={18} />
        Filters
      </div>

      {/* RESOURCES */}
      <div>
        <h4 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Resources</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500">
          {resourceData?.resources?.map((res) => (
            <label key={res._id} className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={filters.resources.includes(res._id)}
                onChange={() => toggleResource(res._id)}
              />
              {res.name}
            </label>
          ))}
        </div>
      </div>

      {/* DOMAINS */}
      <div>
        <h4 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Domain</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500">
          {domainData?.domains?.map((dom) => (
            <label key={dom._id} className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={filters.domains.includes(dom._id)}
                onChange={() => toggleDomain(dom._id)}
              />
              {dom.name}
            </label>
          ))}
        </div>
      </div>

      {/* LEVEL */}
      <div>
        <h4 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Level</h4>
        <div className="space-y-2">
          {["Beginner", "Medium", "Advance"].map((level) => (
            <label key={level} className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={filters.levels.includes(level)}
                onChange={() => toggleLevel(level)}
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      {/* AUTHORS */}
      {authorsList.length > 0 && (
        <div>
          <h4 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Instructor / Author</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500">
            {authorsList.map((author) => (
              <label key={author} className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={filters.authors.includes(author)}
                  onChange={() => toggleAuthor(author)}
                />
                <span className="truncate" title={author}>{author}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* PRICE RANGE */}
      <div>
        <h4 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Price</h4>
        <div className="space-y-2">
          <label className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer font-semibold">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              checked={filters.priceRange === "free"}
              onChange={() => setPriceRange("free")}
            />
            Free
          </label>
          {[
            { label: "1000 - 5000", value: "1000-5000" },
            { label: "5000 - 10000", value: "5000-10000" },
            { label: "10000 - 15000", value: "10000-15000" },
            { label: "15000 - 20000", value: "15000-20000" },
            { label: "20000 - 25000", value: "20000-25000" },
            // { label: "25000 - 30000", value: "25000-30000" },
            { label: "25000+", value: "25000-999999" },
          ].map((range) => (
            <label key={range.value} className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                className="mr-2 h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={filters.priceRange === range.value}
                onChange={() => setPriceRange(range.value)}
              />
              INR {range.label}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFilters({ resources: [], domains: [], levels: [], authors: [], priceRange: "" })}
        className="w-full text-xs font-bold uppercase tracking-tighter text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );

  /* ---------------- LAYOUT ---------------- */

  return (
    <div className="h-screen bg-gray-50">
      <div className="pt-[110px] h-full">
        <div className="flex h-full max-w-full mx-auto px-2 gap-4">

          {/* LEFT FILTER SIDEBAR */}
          <aside className="hidden md:block w-[15%] sticky top-[110px] h-fit max-h-[calc(100vh-140px)] overflow-y-auto bg-teal-200/20 border border-gray-200 rounded-xl p-6 shadow-sm scrollbar-thin scrollbar-thumb-teal-200">
            <FilterContent />
          </aside>

          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden fixed bottom-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-lg"
          >
            <Filter size={20} />
          </button>

          {/* MOBILE FILTER DRAWER */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[80%] bg-white p-5 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X />
                  </button>
                </div>
                <FilterContent />
              </div>
            </div>
          )}

          {/* RIGHT CARDS */}
          <main className="flex-1 h-[calc(100vh-120px)] overflow-y-auto pb-12">
            {filteredData.length === 0 ? (
              <p className="text-center text-gray-500 mt-20">
                No resources found.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {filteredData.map((item) => (
                  <Course
                    key={item._id}
                    courseId={item._id}
                    className="w-full"
                    type={item.isEbook ? "E-Book" : item.resource?.type}
                    image={item.isEbook ? item.thumbnail : item.courseThumbnail?.url || item.courseThumbnail}
                    title={item.isEbook ? item.title : item.courseTitle}
                    price={item.isEbook ? item.price : item.coursePrice}
                    duration={item.isEbook ? item.noOfPages : item.courseDuration}
                    instructorName={item.isEbook ? item.authorName : item.creator?.name}
                    instructorAvatar={item.isEbook ? (item.authorImage || item.creator?.photoUrl) : item.creator?.photoUrl}
                    level={item.isEbook ? "E-Book" : item.courseLevel}
                    isEbook={item.isEbook}
                    isbn={item.isbn}
                    language={item.language}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
