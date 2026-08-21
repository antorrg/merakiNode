import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface BrandInfo {
  appName: string;
  shortName: string;
  legalName?: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  customHeaderNotes?: string;
}

export const DEFAULT_BRAND: BrandInfo = {
  appName: 'Meraki Espacio Integral',
  shortName: 'Meraki',
  legalName: 'Espacio Integral Meraki',
  logoUrl: '/medicalLogo.png',
  phone: '',
  email: '',
  address: '',
  customHeaderNotes: '',
};

export interface BrandContextType {
  brand: BrandInfo;
  loading: boolean;
  updateBrand: (newBrand: Partial<BrandInfo>) => Promise<boolean>;
  refreshBrand: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<BrandInfo>(DEFAULT_BRAND);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBrand = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).api?.invoke) {
        const res = await (window as any).api.invoke('brand:get');
        const rawData = res && typeof res === 'object' && 'data' in res ? (res as any).data : res;
        if (rawData) {
          const loadedBrand: BrandInfo = {
            ...DEFAULT_BRAND,
            ...rawData,
          };
          setBrand(loadedBrand);
          if (loadedBrand.appName) {
            document.title = loadedBrand.appName;
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar la información de la marca:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const updateBrand = async (newBrandData: Partial<BrandInfo>): Promise<boolean> => {
    try {
      const updatedBrand = { ...brand, ...newBrandData };
      setBrand(updatedBrand);
      if (updatedBrand.appName) {
        document.title = updatedBrand.appName;
      }

      if (typeof window !== 'undefined' && (window as any).api?.invoke) {
        await (window as any).api.invoke('config:save', {
          config: {
            appName: updatedBrand.appName,
            shortName: updatedBrand.shortName,
            legalName: updatedBrand.legalName,
            logoUrl: updatedBrand.logoUrl,
            phone: updatedBrand.phone,
            email: updatedBrand.email,
            address: updatedBrand.address,
            customHeaderNotes: updatedBrand.customHeaderNotes,
            pdf: {
              institutionName: updatedBrand.appName,
              logoUrl: updatedBrand.logoUrl,
              customHeaderNotes: updatedBrand.customHeaderNotes,
            },
          },
        });
      }
      return true;
    } catch (err) {
      console.error('Error al actualizar la marca:', err);
      return false;
    }
  };

  return (
    <BrandContext.Provider
      value={{
        brand,
        loading,
        updateBrand,
        refreshBrand: fetchBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand debe usarse dentro de un BrandProvider');
  }
  return context;
};
