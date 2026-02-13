import React, { useState, useEffect } from 'react';
import { fetchClients, deleteClient, createClient, updateClient } from '../services/api';
import { format } from 'date-fns';
import ClientFormModal from '../components/ClientFormModal';
import { Button, IconButton, Menu, MenuItem, CircularProgress, Box, Typography, Grid, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';

const StatusBadge = ({ status }) => {
  const statusInfo = {
    potencial: { text: 'Potencial', color: 'success' },
    no_potencial: { text: 'No Potencial', color: 'error' },
    intermedio: { text: 'Intermedio', color: 'warning' },
  };
  const info = statusInfo[status] || { text: 'Desconocido', color: 'disabled' };
  return (
    <Box component="span" sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.5,
      py: 0.5,
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'medium',
      bgcolor: `${info.color}.lighter`,
      color: `${info.color}.darker`,
    }}>
      <Box component="span" sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: `${info.color}.main`,
        mr: 1,
      }}/>
      {info.text}
    </Box>
  );
};

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(client);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(client.id);
    handleMenuClose();
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 4, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
            {client.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contactado el: {format(new Date(client.contactDate), 'dd/MM/yyyy')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleEdit}>Editar</MenuItem>
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <PhoneIcon sx={{ mr: 1.5, color: 'text.secondary' }} fontSize="small" />
          <Typography variant="body2" color="text.primary">{client.phone || 'No disponible'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <StorefrontIcon sx={{ mr: 1.5, color: 'text.secondary' }} fontSize="small" />
          <Typography variant="body2" color="text.primary">{client.vendingMachineModel || 'No especificado'}</Typography>
        </Box>
      </Box>
      
      <Box>
        <StatusBadge status={client.status} />
      </Box>
    </Paper>
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
      setClients(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
        await updateClient(selectedClient.id, formData);
      } else {
        await createClient(formData);
      }
      handleCloseModal();
      loadClients();
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
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Clientes Potenciales
          </Typography>
          <Typography color="text.secondary">
            Gestiona la lista de todos tus clientes potenciales.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => handleOpenModal()}>
          Añadir Cliente
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          Error: {error}
        </Typography>
      )}
      {!loading && !error && (
        <>
          {clients.length > 0 ? (
            <Grid container spacing={3}>
              {clients.map((client) => (
                <Grid item xs={12} sm={6} md={4} key={client.id}>
                  <ClientCard client={client} onEdit={handleOpenModal} onDelete={handleDelete} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron clientes.
              </Typography>
              <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mt: 2 }}>
                Crear primer cliente
              </Button>
            </Box>
          )}
        </>
      )}

      <ClientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        client={selectedClient}
      />
    </Box>
  );
}

export default ClientsPage;
