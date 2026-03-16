export interface IDonationRequest {
  _id: string;
  bloodGroup: string;
  donationDate: string;
  donationTime: string;
  recipientName: string;
  recipientPhone: string;
  hospitalName: string;
  location: Address;
  additionalMessage?: string;
  donationStatus: string;

  requesterId?: {
    _id: string;
    fullName: string;
    avatar?: string;
  };

  urgency: "Normal" | "Urgent" | "Emergency";
  createdAt: string;
  totalUnitsNeeded: number;

  potentialDonors?: PotentialDonor[];
}

export interface PotentialDonor {
  _id: string;
  status: "interested" | "accepted" | "rejected";
  appliedAt: string;

  donorId: {
    _id: string;
    fullName: string;
    avatar?: string;
    phone?: string;
    bloodGroup?: string;
  };
}

export interface Address {
  address: string;
  city?: string;
  coordinates: [number, number];
}
