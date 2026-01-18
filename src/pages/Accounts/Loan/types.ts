export interface LoanModel {
  xtrnnum: string;
  xref: string;
  certificate_no: string;
  disbursement_date: string;
  interest_date: number;
  xamount: string;
  interest_rate: string;
  xnote: string;
  xstatus: string;
  loan_type: "CERTIFICATE" | "ADVANCE" | "";
  interest_frequency: "Monthly" | "Weekly" | "Daily" | "Yearly" | "";
  payment_type: "PRINCIPAL" | "INTEREST" | "FEES" | "";
  payment_method: "CASH" | "BANK_TRANSFER" | "CHECK" | "MFS" | "";
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

export type LoanForm = {
  loan_type: "CERTIFICATE" | "ADVANCE" | "";
  xref: string;
  certificate_no: string;
  xamount: string;
  interest_rate: string;
  interest_frequency: "Monthly" | "Weekly" | "Daily" | "Yearly" | "";
  payment_type: "PRINCIPAL" | "INTEREST" | "FEES" | "";
  payment_method: "CASH" | "BANK_TRANSFER" | "CHECK" | "MFS" | "";
  xnote: string;
  interest_date: string;
};

export interface CertificateModel {
  created_at: string;
  updated_at: string;
  booking_no: string;
  token_no: string;
}
