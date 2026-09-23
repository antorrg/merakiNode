import React, { useState, useEffect, type ReactNode } from 'react';
import { BrandContext, DEFAULT_BRAND, type BrandInfo } from './useBrand';

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<BrandInfo>(DEFAULT_BRAND);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBrand = async () => {
    try {
      if (typeof window !== 'undefined' && window.api?.invoke) {
        const res = await window.api.invoke<{ data?: BrandInfo } | BrandInfo>('brand:get');
        const rawData = res && typeof res === 'object' && 'data' in res ? res.data : res;
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

      if (typeof window !== 'undefined' && window.api?.invoke) {
        await window.api.invoke('config:save', {
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
