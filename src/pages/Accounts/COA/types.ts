export interface AccountsGroup {
  xhrc1?: string;
  xhrc2?: string;
  xhrc3?: string;
  xhrc4?: string;
  xdesc: string;
  xlong: string | null;
  children: AccountsGroup[];
}

export interface AccountsGroupTreeProps {
  selectedGroup: string | null;
  onSelectGroup: (
    groupId: string | null,
    groupData: AccountsGroup | null
  ) => void;
}

export interface ControllerAccountsProps {
  selectedGroup: AccountsGroup | null;
}

export interface ControllerAccountModel {
  pk: string;
  xacc: string;
  xdesc: string;
  xacctype: string | null;
  xaccusage: string | null;
  xaccsource: string | null;
  xaccgroup: string | null;
  xmsttype: string | null;
  xaccgroup1: string | null;
  xcashacc: string | null;
  xcoracc: string | null;
  xhrc1: string | null;
  xhrc2: string | null;
  xhrc3: string | null;
  xhrc4: string | null;
  xhrc5: string | null;
  zactive: boolean;
  xteam: string | null;
  xmember: string | null;
  xmanager: string | null;
  created_at: string;
  updated_at: string;
  business_id: number;
  created_by: number | null;
  updated_by: number | null;
}

export interface ControllerAccountForm {
  xacc: string;
  xdesc: string;
  xacctype: string;
  xaccusage: string;
  xaccsource: string;
  xaccgroup: string;
  xhrc1: string;
  xhrc2: string;
  xhrc3: string;
  xhrc4: string;
  xhrc5: string;
  zactive: boolean;
}
