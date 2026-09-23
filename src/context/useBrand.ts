import { createContext, useContext } from 'react';
import { DEFAULT_APP_CONFIG, type AppConfig } from '../../electron/config.types';
import medicalLogo from '../assets/medicalLogo.svg'

export type BrandInfo = Omit<AppConfig, 'pdf' | 'backup' | 'logoUrl'> & {
  logoUrl: string;
};

export const DEFAULT_BRAND: BrandInfo = {
  appName: DEFAULT_APP_CONFIG.appName,
  shortName: DEFAULT_APP_CONFIG.shortName,
  legalName: DEFAULT_APP_CONFIG.legalName,
  logoUrl: DEFAULT_APP_CONFIG.logoUrl ?? medicalLogo,
  phone: DEFAULT_APP_CONFIG.phone,
  email: DEFAULT_APP_CONFIG.email,
  address: DEFAULT_APP_CONFIG.address,
  customHeaderNotes: DEFAULT_APP_CONFIG.customHeaderNotes,
};

export type UpdateBrandInput = Partial<Omit<BrandInfo, 'logoUrl'> & { logoUrl?: string | null }>;

export interface BrandContextType {
  brand: BrandInfo;
  loading: boolean;
  updateBrand: (newBrand: UpdateBrandInput) => Promise<boolean>;
  refreshBrand: () => Promise<void>;
}

export const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand debe usarse dentro de un BrandProvider');
  }
  return context;
};
