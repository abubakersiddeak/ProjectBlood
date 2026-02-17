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
}
export interface Address {
  address: string;
  city?: string;
  coordinates: [number, number];
}
