import { IPotentialDonor } from "./modelTyps";

export interface FIBloodDonationRequest {
  requesterId: {
    avatar: string;
    fullName: string;
    _id: string;
  };
  recipientName: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  totalUnitsNeeded: number;
  unitsFulfilled: number;
  hospitalName: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city?: string;
  };
  donationDate: Date;
  donationTime: string;
  recipientPhone: string;
  urgency: "Normal" | "Urgent" | "Emergency";
  donationStatus: "pending" | "in-progress" | "success" | "cancel";
  potentialDonors: IPotentialDonor[];
  additionalMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}
