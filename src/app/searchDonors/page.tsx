"use client";

import server from "@/lib/api";
import { useState, FormEvent, ChangeEvent } from "react";
import { Search, Droplet, MapPin, RotateCcw, XCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BLOOD_GROUPS } from "@/lib/constants";
import { DISTRICT_LIST, getUpazilasByDistrict } from "@/lib/geoLocationUtils";
import DonorCard from "@/components/card/DonorCard";

// Types & Interfaces
interface FormData {
  bloodGroup: string;
  district: string;
  upazila: string;
}

interface Donor {
  _id: string;
  fullName: string;
  bloodGroup: string;
  phone?: string;
  email?: string;
  address?: string;
  lastDonation?: string | Date;
}

export default function SearchPage() {
  const [formData, setFormData] = useState<FormData>({
    bloodGroup: "",
    district: "",
    upazila: "",
  });
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset upazila if district changes
      ...(name === "district" && { upazila: "" }),
    }));
  };

  const resetFilters = () => {
    setFormData({
      bloodGroup: "",
      district: "",
      upazila: "",
    });
    setFilteredDonors([]);
    setHasSearched(false);
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setFilteredDonors([]);

    try {
      const queryParams = new URLSearchParams();
      if (formData.bloodGroup)
        queryParams.append("bloodGroup", formData.bloodGroup);
      if (formData.district) queryParams.append("district", formData.district);
      if (formData.upazila) queryParams.append("upazila", formData.upazila);
      queryParams.append("limit", "100");

      const response = await server.get(
        `/api/users/search-donors?${queryParams.toString()}`,
      );

      if (response.data.success) {
        setFilteredDonors(response.data.data || []);
      } else {
        setFilteredDonors([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setFilteredDonors([]);
    } finally {
      setLoading(false);
    }
  };
  console.log(formData);
  console.log(filteredDonors);
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen py-20">
        <div className="max-w-7xl px-4 2xl:px-0 mx-auto">
          {/* Header & Search Section */}
          <div className="mb-12 space-y-8">
            <div className="border-b border-black/10 pb-6">
              <h2 className="text-2xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Find Blood Donors
              </h2>
              <p className="text-gray-500 mt-2 text-sm md:text-base max-w-2xl">
                Search for potential donors based on location and blood group.
              </p>
            </div>

            {/* Filter Bar/Form */}
            <form
              onSubmit={handleSearch}
              className="bg-gray-50 p-6 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Blood Group Filter */}
                <div className="relative">
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-4 pr-10 bg-white border border-gray-300 text-black appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-none cursor-pointer font-medium"
                  >
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Droplet size={18} />
                  </div>
                </div>

                {/* District Filter */}
                <div className="relative">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-4 pr-10 bg-white border border-gray-300 text-black appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-none cursor-pointer font-medium"
                  >
                    <option value="">Select District</option>
                    {DISTRICT_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                </div>

                {/* Upazila Filter */}
                <div className="relative">
                  <select
                    name="upazila"
                    value={formData.upazila}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-4 pr-10 bg-white border border-gray-300 text-black appearance-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-none cursor-pointer font-medium ${
                      !formData.district ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!formData.district}
                  >
                    <option value="">Select Upazila</option>
                    {formData.district &&
                      getUpazilasByDistrict(formData.district).map((u) => {
                        return (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        );
                      })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 cursor-pointer bg-black text-white hover:bg-red-600 border border-black hover:border-red-600 font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 rounded-none disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
                >
                  <Search size={18} />
                  {loading ? "Searching..." : "Search Donors"}
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                type="button"
                className="mt-4 text-xs font-bold uppercase text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={14} /> Clear Filters
              </button>
            </form>
          </div>

          {/* Results Section */}
          {hasSearched && (
            <div>
              {loading ? (
                <div className="w-full h-32 flex items-center justify-center border border-gray-200 bg-gray-50">
                  <div className="animate-pulse text-gray-400 font-mono text-sm">
                    LOADING DONORS...
                  </div>
                </div>
              ) : filteredDonors.length === 0 ? (
                <div className="border border-black p-12 text-center bg-gray-50">
                  <XCircle size={32} className="text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold uppercase text-black">
                    No Donors Found
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search criteria or check back later.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-block mt-6 cursor-pointer text-red-600 font-bold hover:underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-black uppercase tracking-tight mb-6 border-b border-black/10 pb-2">
                    Found{" "}
                    <span className="text-red-600">
                      {filteredDonors.length}
                    </span>{" "}
                    Donor{filteredDonors.length !== 1 ? "s" : ""}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                    {filteredDonors.map((donor) => (
                      <DonorCard key={donor._id} donor={donor} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
