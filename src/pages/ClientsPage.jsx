import React, { useState, useEffect } from 'react';
import { fetchClients, deleteClient, createClient, updateClient } from '../services/api';
import { format } from 'date-fns';
import ClientFormModal from '../components/ClientFormModal';
import { Button } from '@mui/material';


// Simple status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    potencial: 'bg-green-100 text-green-800',
    no_potencial: 'bg-red-100 text-red-800',
    intermedio: 'bg-yellow-100 text-yellow-800',
  };
  const statusText = {
    potencial: 'Potencial',
    no_potencial: 'No Potencial',
    intermedio: 'Intermedio',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {statusText[status] || 'Desconocido'}
    </span>
  );
};

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (formData) => {
    try {
      if (selectedClient) {
        // Update existing client
        await updateClient(selectedClient.id, formData);
      } else {
        // Create new client
        await createClient(formData);
      }
      handleCloseModal();
      loadClients(); // Refresh client list
    } catch (err) {
      console.error('Error saving client:', err);
      setError('No se pudo guardar el cliente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await deleteClient(id);
        setClients(clients.filter((client) => client.id !== id));
      } catch (err) {
        console.error('Error deleting client:', err);
        setError('No se pudo eliminar el cliente.');
      }
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Clientes Potenciales
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Una lista de todos los clientes potenciales registrados.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            variant="contained"
            onClick={() => handleOpenModal()}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Añadir Cliente
          </Button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {loading && <p>Cargando clientes...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Nombre</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Modelo Máquina</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estatus</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha Contacto</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{client.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.phone || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.vendingMachineModel || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={client.status} /></td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(new Date(client.contactDate), 'dd/MM/yyyy')}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => handleOpenModal(client)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDelete(client.id)} className="ml-4 text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
             {clients.length === 0 && !loading && !error && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron clientes.</p>
                   <Button variant="contained" onClick={() => handleOpenModal()} sx={{mt: 2}}>
                      Crear primer cliente
                  </Button>
                </div>
            )}
          </div>
        </div>
      </div>
       <ClientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        client={selectedClient}
      />
    </div>
  );
}

export default ClientsPage;
