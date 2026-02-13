import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to protect all client routes
router.use(authenticateToken);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        createdById: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

// Create a new client
router.post('/', async (req, res) => {
  const { name, phone, vendingMachineModel, status, contactDate, address, equipmentCost, freightCost, travelCost } = req.body;
  try {
    const newClient = await prisma.client.create({
      data: {
        name,
        phone,
        vendingMachineModel,
        address,
        equipmentCost: equipmentCost ? parseFloat(equipmentCost) : null,
        freightCost: freightCost ? parseFloat(freightCost) : null,
        travelCost: travelCost ? parseFloat(travelCost) : null,
        status,
        contactDate: contactDate ? new Date(contactDate) : new Date(),
        createdById: req.user.id,
      },
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Error creating client' });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, vendingMachineModel, status, contactDate, address, equipmentCost, freightCost, travelCost } = req.body;
  try {
    // Ensure the client belongs to the user trying to update it
    const client = await prisma.client.findFirst({
        where: { id: parseInt(id), createdById: req.user.id }
    });

    if (!client) {
        return res.status(404).json({ message: "Client not found or you don't have permission" });
    }

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone,
        vendingMachineModel,
        address,
        equipmentCost: equipmentCost !== undefined ? parseFloat(equipmentCost) : undefined,
        freightCost: freightCost !== undefined ? parseFloat(freightCost) : undefined,
        travelCost: travelCost !== undefined ? parseFloat(travelCost) : undefined,
        status,
        contactDate: contactDate ? new Date(contactDate) : undefined,
      },
    });
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Error updating client' });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
     // Ensure the client belongs to the user trying to delete it
    const client = await prisma.client.findFirst({
        where: { id: parseInt(id), createdById: req.user.id }
    });

    if (!client) {
        return res.status(404).json({ message: "Client not found or you don't have permission" });
    }

    await prisma.client.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Error deleting client' });
  }
});

export default router;
