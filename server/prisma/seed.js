// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { users as mockUsers, tasks as mockTasks, messages as mockMessages } from '../data.js';

const prisma = new PrismaClient();

const contentPlan = `
🔹 MES 1 – POSICIONAMIENTO & CONFIANZA
Objetivo: Que conozcan Darmax Agua, qué vendes y por qué es rentable.
Semana 1
Lunes | POST: ¿Quién es Darmax Agua y por qué somos líderes en purificación? 💧
Martes | CARRUSEL: Beneficios de invertir en una vending de agua
Miércoles | POST: Frase emprendedora + llamado a la acción
Jueves | CARRUSEL: ¿Cómo funciona una vending Darmax paso a paso?
Viernes | POST: “Es tu momento de emprender” + CTA a WhatsApp
Semana 2
Lunes | POST: Problemas del agua en México y cómo los solucionamos
Martes | CARRUSEL: Tipos de negocios que pueden instalar Darmax
Miércoles | POST: Mito vs realidad sobre vender agua purificada
Jueves | CARRUSEL: Inversión inicial vs ganancias reales
Viernes | POST: Testimonio corto / caso de éxito
Semana 3
Lunes | POST: ¿Por qué el agua es un negocio que nunca se detiene?
Martes | CARRUSEL: Ventajas de operar 24/7
Miércoles | POST: Frase poderosa para emprendedores
Jueves | CARRUSEL: ¿Dónde instalar tu vending para vender más?
Viernes | POST: Invitación a pedir info con asesor
Semana 4
Lunes | POST: Presentación de modelos Darmax
Martes | CARRUSEL: Diferencias entre vending tradicional y touch
Miércoles | POST: Errores comunes al emprender (y cómo evitarlos)
Jueves | CARRUSEL: ¿Qué incluye tu compra con Darmax?
Viernes | POST: CTA fuerte: agenda llamada / WhatsApp
🔹 MES 2 – EDUCACIÓN & AUTORIDAD
Objetivo: Que te vean como expertos y confíen para invertir.
Semana 5
Lunes | POST: Importancia del agua purificada en hogares y negocios
Martes | CARRUSEL: Etapas del tren de filtrado Darmax
Miércoles | POST: ¿Cuánta agua consume una familia al mes?
Jueves | CARRUSEL: Beneficios del agua purificada vs garrafón comercial
Viernes | POST: CTA: instala Darmax en tu colonia
Semana 6
Lunes | POST: Negocios que nunca pasan de moda
Martes | CARRUSEL: Comparativa: empleo tradicional vs vending
Miércoles | POST: Frase de mentalidad financiera
Jueves | CARRUSEL: Mantenimiento y soporte Darmax
Viernes | POST: Pregunta interactiva + CTA
Semana 7
Lunes | POST: ¿Por qué el agua es necesidad básica?
Martes | CARRUSEL: Zonas estratégicas para instalación
Miércoles | POST: Historia breve de un cliente
Jueves | CARRUSEL: Ingresos mensuales estimados
Viernes | POST: Lead magnet: “pide costos por WhatsApp”
Semana 8
Lunes | POST: Diferencia entre vender agua y otros giros
Martes | CARRUSEL: Errores que te cuestan ventas
Miércoles | POST: Frase inspiradora Darmax
Jueves | CARRUSEL: Beneficios para la familia + negocio
Viernes | POST: CTA directo a asesor
🔹 MES 3 – VENTAS & CONVERSIÓN
Objetivo: Cerrar ventas y generar urgencia.
Semana 9
Lunes | POST: ¿Cuánto tardas en recuperar tu inversión?
Martes | CARRUSEL: Paquetes y modelos disponibles
Miércoles | POST: Caso real de retorno de inversión
Jueves | CARRUSEL: Pasos para iniciar hoy mismo
Viernes | POST: CTA: últimos espacios del mes
Semana 10
Lunes | POST: ¿Por qué ahora es el mejor momento para invertir?
Martes | CARRUSEL: Beneficios fiscales / operativos
Miércoles | POST: Frase de acción y decisión
Jueves | CARRUSEL: Comparativa de modelos
Viernes | POST: Promoción o bono limitado
Semana 11
Lunes | POST: Respuesta a preguntas frecuentes
Martes | CARRUSEL: Antes y después de instalar Darmax
Miércoles | POST: Mentalidad de dueño de negocio
Jueves | CARRUSEL: Testimonios reales
Viernes | POST: CTA: agenda tu llamada
Semana 12
Lunes | POST: Resumen de beneficios Darmax
Martes | CARRUSEL: Todo lo que incluye tu inversión
Miércoles | POST: Frase final de empuje
Jueves | CARRUSEL: ¿Qué esperas para comenzar?
Viernes | POST: Cierre mensual + urgencia
`;

async function parseAndScheduleContentPlan(plan, userId) {
    const lines = plan.split('\n').filter(line => line.trim() !== '');
    const tasks = [];
    let currentDate = new Date('2026-01-26T00:00:00Z'); // Start on Monday, Jan 26, 2026 UTC

    const dayMatcher = /^\s*(Lunes|Martes|Miércoles|Jueves|Viernes)\s*\|/i;

    for (const line of lines) {
        if (dayMatcher.test(line)) {
            const title = line.substring(line.indexOf('|') + 1).trim();
            
            const startTime = new Date(currentDate);
            startTime.setUTCHours(10, 0, 0, 0);

            const endTime = new Date(currentDate);
            endTime.setUTCHours(18, 0, 0, 0);
            
            tasks.push({
                title: title,
                description: 'Publicación de contenido según calendario.',
                startTime: startTime,
                endTime: endTime,
                completed: false,
                priority: 'media',
                userId: userId,
            });

            // Move to the next day
            if (currentDate.getUTCDay() === 5) { // It's Friday
                currentDate.setUTCDate(currentDate.getUTCDate() + 3); // Move to Monday
            } else {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Move to next day
            }
        }
    }
    return tasks;
}


async function main() {
  console.log('Start seeding ...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'CEO@darmaxagua.mx' },
    update: { name: 'Admin', password: adminPassword, role: 'admin' },
    create: { name: 'Admin', email: 'CEO@darmaxagua.mx', password: adminPassword, role: 'admin' },
  });
  console.log('Admin user seeded (CEO@darmaxagua.mx / admin123). Please change the password immediately.');

  // Keep mock users for other development purposes if needed
  for (const user of mockUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: hashedPassword },
    });
  }
  console.log('Mock users seeded.');

  // --- "Poison Pill" Test for Debugging ---
  console.log('--- RUNNING "POISON PILL" TEST FOR DEBUGGING ---');
  console.log('Attempting to create a user with an existing unique email to force an error.');

  try {
    await prisma.user.create({
      data: {
        name: 'Test Duplicate',
        email: 'diegolarregui14@outlook.com', // This email MUST exist
        password: 'password123',
      }
    });
    console.warn('[UNEXPECTED SUCCESS] The creation of a duplicate user did NOT fail. This strongly suggests the database connection is read-only or not committing writes.');
  } catch (error) {
    console.log('[EXPECTED ERROR] Successfully caught an error, as expected.');
    console.log('This proves that write operations CAN reach the database and produce errors.');
    console.log('The issue is likely specific to the "Task" table (permissions, policy, or trigger).');
    console.log('Error code:', error.code);
  }

  console.log('--- "POISON PILL" TEST FINISHED ---');
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
