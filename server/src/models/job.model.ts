export interface PublicJobBoardRow {
  id: string;
  company_id: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  created_at: string;
  company_name: string | null;
  company_phone: string | null;
}

export interface PublicJobResponse {
  id: string;
  companyId: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  createdAt: string;
  company: {
    name: string | null;
    phone: string | null;
  };
}
