import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Spinner, Nav, Tab } from 'react-bootstrap';
import { useConfigStore } from './useConfigStore';
import { useBrand } from '../../../context/BrandContext';
import { toast } from '../../../shared/components/toast/toastManager';
import  { tabsData } from './components/configComponents/tabsData';
import ConfigurationLoader from './components/configComponents/ConfigurationLoader';


const Configuration: React.FC = () => {
  const { refreshBrand } = useBrand();
  const { isLoading, isSaving, fetchConfig, saveConfig } = useConfigStore();
  const [activeTab, setActiveTab] = useState<string>('identity');

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveConfig();
    if (ok) {
      await refreshBrand();
      toast.success('Configuración guardada correctamente');
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* Cabecera Principal */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
            ⚙️ Configuración del Sistema
          </h2>
          <p className="text-muted mb-0 small">
            Personaliza la identidad institucional, exportación de PDFs, copias de seguridad y registros del sistema.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="d-flex align-items-center gap-2 px-4 shadow-sm fw-semibold"
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" />
              Guardando...
            </>
          ) : (
            <>💾 Guardar Cambios</>
          )}
        </Button>
      </div>

      {isLoading ? (
      <ConfigurationLoader/>
      ) : (
        <Form onSubmit={handleSave}>
          <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
            {/* Navegación por Pestañas Integradas con la Página */}
            <Card className="border-0 shadow-sm mb-0 rounded-top">
              <Card.Header className="bg-white border-bottom pb-0 pt-2 px-2">
                <Nav
                  variant="tabs"
                  className="flex-nowrap  border-bottom-0"
                  style={{
                    overflowX: 'auto',
                    overflowY: 'hidden', // 👈 Desactiva el scroll vertical
                    scrollbarWidth: 'thin',
                    marginBottom: '-1px', // Solapa y elimina la línea inferior sólo en la pestaña activa
                  }}
                >
                  {tabsData?.map((t) => {
                    const isActive = activeTab === t.nameKey;
                    return (
                      <Nav.Item key={t.nameKey} className="text-nowrap">
                        <Nav.Link
                          eventKey={t.nameKey}
                          className={`d-flex align-items-center gap-2 py-2 px-3 fw-semibold text-nowrap rounded-top ${
                            isActive
                              ? 'bg-white text-primary border border-bottom-0 fw-bold'
                              : 'text-muted border-0 bg-transparent'
                          }`}
                          style={{
                            transition: 'color 0.15s ease-in-out',
                          }}
                        >
                          {t.text}
                        </Nav.Link>
                      </Nav.Item>
                    );
                  })}
                </Nav>
              </Card.Header>
            </Card>

            {/* Contenido Modular de las Pestañas */}
            <Tab.Content>
              {tabsData.map(({ nameKey, component: Component }) => (
                <Tab.Pane key={nameKey} eventKey={nameKey}>
                  <Component />
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Tab.Container>
        </Form>
      )}
    </Container>
  );
};

export default Configuration;
