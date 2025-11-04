export interface Level1Model {
  xhrc1: string;
  xdesc: string;
}

export interface CustomerModel {
  create_date: string;
  customer_code: string;
  customer_name: string;
  contact_person: string;
  xmobile: string;
  xemail: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  post_office: string;
  village: string;
  xaddress: number;
  trade_license_number: string;
  bin_number: number;
  tin_number: number;
  is_active: boolean;
}

export type Level1Form = {
  xhrc1: string;
  xdesc: string;
};

export interface CertificateModel {
  created_at: string;
  updated_at: string;
  booking_no: string;
  token_no: string;
}
