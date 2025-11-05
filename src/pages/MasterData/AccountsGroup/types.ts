export interface Level1Model {
  xhrc1: string;
  xdesc: string;
}

export type Level1Form = {
  xhrc1: string;
  xdesc: string;
};
export interface Level2Model {
  xhrc1: string;
  xhrc2: string;
  xdesc: string;
}

export type Level2Form = {
  xhrc1: string;
  xhrc2: string;
  xdesc: string;
};
export interface Level3Model {
  xhrc3: string;
  xdesc: string;
  xhrc1: string;
  xhrc2: string;
}

export interface Level3Form {
  xhrc3: string;
  xdesc: string;
  xhrc1: string;
  xhrc2: string;
}

export interface Level1GroupProps {
  onNavigateToLevel2?: (level1Code: string) => void;
}

export interface Level2GroupProps {
  preselectedLevel1?: string;
  onNavigateToLevel3?: (level1Code: string, level2Code: string) => void;
}
export interface Level3GroupProps {
  preselectedLevel1?: string;
  preselectedLevel2?: string;
  onNavigateToLevel4?: (
    level1Code: string,
    level2Code: string,
    level3Code: string
  ) => void;
}
export interface Level4Model {
  xhrc4: string;
  xdesc: string;
  xhrc1: string;
  xhrc2: string;
  xhrc3: string;
}

export interface Level4Form {
  xhrc4: string;
  xdesc: string;
  xhrc1: string;
  xhrc2: string;
  xhrc3: string;
}

export interface Level4GroupProps {
  preselectedLevel1?: string;
  preselectedLevel2?: string;
  preselectedLevel3?: string;
}
