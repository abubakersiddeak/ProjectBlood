import geoData from "@/data/db_geocode.json";

// Types based on your JSON structure
interface GeoDataNode {
  type: string;
  name: string;
  data: any[];
}

// 1. Extract the tables safely
const districtsTable = geoData.find(
  (node) => node.type === "table" && node.name === "districts",
) as GeoDataNode;
const upazilasTable = geoData.find(
  (node) => node.type === "table" && node.name === "upazilas",
) as GeoDataNode;

const districts = districtsTable?.data || [];
const upazilas = upazilasTable?.data || [];

// 2. Export list for the District Dropdown
export const DISTRICT_LIST = districts.map((d: any) => d.name).sort();

// 3. Logic to get Upazilas and Point Coordinates
export const getGeoDetails = (districtName?: string, upazilaName?: string) => {
  if (!districtName) {
    return { upazilas: [], coordinates: [] };
  }

  const district = districts.find((d: any) => d.name === districtName);

  if (!district) {
    return { upazilas: [], coordinates: [] };
  }

  // 🔹 Upazila list for dropdown
  const filteredUpazilas = upazilas
    .filter((u: any) => u.district_id === district.id)
    .map((u: any) => u.name)
    .sort();

  //  If upazila selected → use upazila coordinates
  if (upazilaName) {
    const upazila = upazilas.find(
      (u: any) => u.district_id === district.id && u.name === upazilaName,
    );

    if (upazila?.lat && upazila?.lng) {
      return {
        upazilas: filteredUpazilas,
        coordinates: [parseFloat(upazila.lng), parseFloat(upazila.lat)],
      };
    }
  }

  // 🟡 Fallback → district coordinates
  return {
    upazilas: filteredUpazilas,
    coordinates: [parseFloat(district.lng), parseFloat(district.lat)],
  };
};
