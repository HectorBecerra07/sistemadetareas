
export const users = [
  { id: 1, name: 'Ana Pérez' },
  { id: 2, name: 'Carlos Rivas' },
  { id: 3, name: 'Beatriz Solis' },
];

export const tasks = [
  { id: 1, title: 'Revisar reporte de ventas', userId: 1, completed: false, dueDate: new Date(2026, 0, 18) },
  { id: 2, title: 'Preparar presentación para cliente', userId: 1, completed: false, dueDate: new Date(2026, 0, 20) },
  { id: 3, title: 'Llamada de seguimiento con Proveedor X', userId: 2, completed: true, dueDate: new Date(2026, 0, 15) },
  { id: 4, title: 'Actualizar la base de datos de contactos', userId: 2, completed: false, dueDate: new Date(2026, 0, 19) },
  { id: 5, title: 'Diseñar nuevos mockups para la app', userId: 3, completed: false, dueDate: new Date(2026, 0, 22) },
  { id: 6, title: 'Testear nueva funcionalidad de login', userId: 3, completed: true, dueDate: new Date(2026, 0, 12) },
];

export const messages = [
  { id: 1, from: 1, to: 2, text: 'Hola Carlos, ¿cómo vas con el reporte?' },
  { id: 2, from: 2, to: 1, text: '¡Hola Ana! Ya casi lo termino, te lo envío en un rato.' },
  { id: 3, from: 1, to: 2, text: 'Perfecto, gracias.' },
  { id: 4, from: 3, to: 1, text: 'Ana, ¿puedes revisar los mockups cuando tengas un momento?' },
  { id: 5, from: 1, to: 3, text: 'Claro, Beatriz. Los veo ahora mismo.' },
];
