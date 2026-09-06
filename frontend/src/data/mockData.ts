import type { Paciente } from '../types/paciente'
import type { Cita } from '../types/cita'
import type { Alimento, Platillo } from '../types/alimento'

/* ═══════════════════════════════════════════
   PACIENTES MOCK
═══════════════════════════════════════════ */
export const MOCK_PACIENTES: Paciente[] = [
  {
    id: 'p1', nombre: 'María', apellido: 'García Torres',
    email: 'maria.garcia@gmail.com', telefono: '987654321',
    fechaNacimiento: '1990-04-15', sexo: 'F', dni: '70234567',
    direccion: 'Av. Javier Prado 1240, San Isidro, Lima',
    estado: 'activo', fechaCreacion: '2025-11-10',
    ultimaCita: '2026-06-05T09:00', notas: 'Paciente con hipotiroidismo controlado.',
  },
  {
    id: 'p2', nombre: 'Carlos', apellido: 'López Quispe',
    email: 'carlos.lopez@hotmail.com', telefono: '956321478',
    fechaNacimiento: '1985-08-22', sexo: 'M', dni: '40123456',
    direccion: 'Jr. Huancavelica 320, Cercado de Lima',
    estado: 'activo', fechaCreacion: '2025-12-01',
    ultimaCita: '2026-06-05T11:00', notas: 'Plan para reducción de peso, intolerancia a la lactosa.',
  },
  {
    id: 'p3', nombre: 'Ana', apellido: 'Quispe Mamani',
    email: 'ana.quispe@yahoo.com', telefono: '945678234',
    fechaNacimiento: '1998-01-30', sexo: 'F', dni: '75432198',
    direccion: 'Calle Los Robles 450, Surco, Lima',
    estado: 'activo', fechaCreacion: '2026-01-15',
    ultimaCita: '2026-06-08T15:00',
  },
  {
    id: 'p4', nombre: 'Luis', apellido: 'Mamani Condori',
    email: 'lmamani@gmail.com', telefono: '912345678',
    fechaNacimiento: '2005-07-14', sexo: 'M', dni: '71234567',
    direccion: 'Av. Arequipa 2890, Lince, Lima',
    estado: 'activo', fechaCreacion: '2026-02-20',
    ultimaCita: '2026-06-10T10:00', notas: 'Adolescente deportista. Requiere dieta alta en proteínas.',
  },
  {
    id: 'p5', nombre: 'Rosa', apellido: 'Flores Vega',
    email: 'rosa.flores@gmail.com', telefono: '967891234',
    fechaNacimiento: '1975-11-05', sexo: 'F', dni: '31234567',
    direccion: 'Av. Benavides 1100, Miraflores, Lima',
    estado: 'activo', fechaCreacion: '2026-03-05',
    ultimaCita: '2026-06-12T14:00', notas: 'Diabetes tipo 2. Control glucémico estricto.',
  },
  {
    id: 'p6', nombre: 'David', apellido: 'Torres Sánchez',
    fechaNacimiento: '2018-03-20', sexo: 'M', dni: '91234567',
    estado: 'activo', fechaCreacion: '2026-03-12',
    ultimaCita: '2026-06-15T09:00', notas: 'Niño de 8 años. Seguimiento de talla/peso.',
  },
  {
    id: 'p7', nombre: 'Carmen', apellido: 'Díaz Herrera',
    email: 'carmen.diaz@outlook.com', telefono: '934567812',
    fechaNacimiento: '1993-06-18', sexo: 'F', dni: '73456789',
    direccion: 'Av. Universitaria 450, Los Olivos, Lima',
    estado: 'activo', fechaCreacion: '2026-03-18',
    ultimaCita: '2026-06-15T11:30',
  },
  {
    id: 'p8', nombre: 'Elena', apellido: 'Chávez Ruiz',
    email: 'elena.chavez@gmail.com', telefono: '998765432',
    fechaNacimiento: '1987-09-12', sexo: 'F', dni: '43567890',
    direccion: 'Jr. Camaná 789, Cercado de Lima',
    estado: 'activo', fechaCreacion: '2026-04-01',
    ultimaCita: '2026-06-17T16:00', notas: '22 semanas de embarazo. Control prenatal nutricional.',
  },
  {
    id: 'p9', nombre: 'Pedro', apellido: 'Rojas Castillo',
    email: 'pedro.rojas@gmail.com', telefono: '977654321',
    fechaNacimiento: '1965-12-01', sexo: 'M', dni: '21345678',
    direccion: 'Calle Schell 423, Miraflores, Lima',
    estado: 'inactivo', fechaCreacion: '2025-09-15',
    ultimaCita: '2026-06-19T10:00', notas: 'Hipertensión. Dieta DASH.',
  },
  {
    id: 'p10', nombre: 'Sofía', apellido: 'Mendoza Palomino',
    email: 'sofia.mendoza@gmail.com', telefono: '945123678',
    fechaNacimiento: '2001-02-28', sexo: 'F', dni: '76543219',
    direccion: 'Av. Primavera 1234, San Borja, Lima',
    estado: 'activo', fechaCreacion: '2026-04-10',
    ultimaCita: '2026-06-22T15:00',
  },
  {
    id: 'p11', nombre: 'Miguel', apellido: 'Castro Vargas',
    email: 'miguel.castro@hotmail.com', telefono: '912378456',
    fechaNacimiento: '1978-05-30', sexo: 'M', dni: '28765432',
    direccion: 'Av. Colonial 1890, Breña, Lima',
    estado: 'activo', fechaCreacion: '2026-04-22',
    ultimaCita: '2026-06-24T09:00',
  },
  {
    id: 'p12', nombre: 'Isabel', apellido: 'Vega Morales',
    email: 'isabel.vega@gmail.com', telefono: '963214587',
    fechaNacimiento: '1955-08-15', sexo: 'F', dni: '09876543',
    direccion: 'Calle Porta 180, Miraflores, Lima',
    estado: 'activo', fechaCreacion: '2026-05-01',
    ultimaCita: '2026-06-26T14:00', notas: 'Adulta mayor. Osteoporosis.',
  },
]

/* ═══════════════════════════════════════════
   CITAS MOCK
═══════════════════════════════════════════ */
export const MOCK_CITAS: Cita[] = [
  {
    id: 'c1', pacienteId: 'p1', pacienteNombre: 'María García Torres',
    fecha: '2026-06-05T09:00', tipo: 'primera_vez', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 60,
  },
  {
    id: 'c2', pacienteId: 'p2', pacienteNombre: 'Carlos López Quispe',
    fecha: '2026-06-05T11:00', tipo: 'seguimiento', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 45,
    notas: 'Buen progreso. Bajó 1.2kg en la semana.',
  },
  {
    id: 'c3', pacienteId: 'p3', pacienteNombre: 'Ana Quispe Mamani',
    fecha: '2026-06-08T15:00', tipo: 'control', estado: 'completada',
    modalidad: 'virtual', duracionMinutos: 30,
  },
  {
    id: 'c4', pacienteId: 'p4', pacienteNombre: 'Luis Mamani Condori',
    fecha: '2026-06-10T10:00', tipo: 'primera_vez', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 60,
    notas: 'Evaluación inicial completa. IMC 22.1.',
  },
  {
    id: 'c5', pacienteId: 'p5', pacienteNombre: 'Rosa Flores Vega',
    fecha: '2026-06-12T14:00', tipo: 'seguimiento', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 45,
  },
  {
    id: 'c6', pacienteId: 'p6', pacienteNombre: 'David Torres Sánchez',
    fecha: '2026-06-15T09:00', tipo: 'control', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 30,
  },
  {
    id: 'c7', pacienteId: 'p7', pacienteNombre: 'Carmen Díaz Herrera',
    fecha: '2026-06-15T11:30', tipo: 'seguimiento', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 45,
  },
  {
    id: 'c8', pacienteId: 'p8', pacienteNombre: 'Elena Chávez Ruiz',
    fecha: '2026-06-17T16:00', tipo: 'primera_vez', estado: 'completada',
    modalidad: 'presencial', duracionMinutos: 60,
    notas: 'Evaluación nutricional en embarazo. 22 semanas.',
  },
  {
    id: 'c9', pacienteId: 'p9', pacienteNombre: 'Pedro Rojas Castillo',
    fecha: '2026-06-19T10:00', tipo: 'control', estado: 'no_asistio',
    modalidad: 'presencial', duracionMinutos: 30,
  },
  {
    id: 'c10', pacienteId: 'p10', pacienteNombre: 'Sofía Mendoza Palomino',
    fecha: '2026-06-22T15:00', tipo: 'seguimiento', estado: 'programada',
    modalidad: 'virtual', duracionMinutos: 45,
  },
  {
    id: 'c11', pacienteId: 'p11', pacienteNombre: 'Miguel Castro Vargas',
    fecha: '2026-06-24T09:00', tipo: 'primera_vez', estado: 'programada',
    modalidad: 'presencial', duracionMinutos: 60,
  },
  {
    id: 'c12', pacienteId: 'p12', pacienteNombre: 'Isabel Vega Morales',
    fecha: '2026-06-26T14:00', tipo: 'control', estado: 'programada',
    modalidad: 'presencial', duracionMinutos: 30,
  },
  {
    id: 'c13', pacienteId: 'p1', pacienteNombre: 'María García Torres',
    fecha: '2026-06-28T11:00', tipo: 'seguimiento', estado: 'programada',
    modalidad: 'presencial', duracionMinutos: 45,
  },
  {
    id: 'c14', pacienteId: 'p3', pacienteNombre: 'Ana Quispe Mamani',
    fecha: '2026-07-02T09:00', tipo: 'seguimiento', estado: 'programada',
    modalidad: 'virtual', duracionMinutos: 30,
  },
  {
    id: 'c15', pacienteId: 'p5', pacienteNombre: 'Rosa Flores Vega',
    fecha: '2026-07-05T10:00', tipo: 'control', estado: 'programada',
    modalidad: 'presencial', duracionMinutos: 45,
  },
]

/* ═══════════════════════════════════════════
   ALIMENTOS MOCK
═══════════════════════════════════════════ */
export const MOCK_ALIMENTOS: Alimento[] = [
  // ── TPCA (Perú) ──
  {
    id: 'a1', nombre: 'Quinua cocida', fuente: 'TPCA', categoria: 'Cereales y tubérculos',
    energia: 120, proteinas: 4.4, grasas: 1.9, carbohidratos: 21.3, fibra: 2.8,
    calcio: 17, hierro: 1.5, esPersonalizado: false,
  },
  {
    id: 'a2', nombre: 'Papa amarilla cocida', fuente: 'TPCA', categoria: 'Cereales y tubérculos',
    energia: 91, proteinas: 2.1, grasas: 0.1, carbohidratos: 20.9, fibra: 1.9,
    potasio: 379, vitaminaC: 19, esPersonalizado: false,
  } as Alimento,
  {
    id: 'a3', nombre: 'Kiwicha (amaranto) cocida', fuente: 'TPCA', categoria: 'Cereales y tubérculos',
    energia: 102, proteinas: 3.8, grasas: 1.7, carbohidratos: 18.7, fibra: 2.1,
    calcio: 47, hierro: 2.1, esPersonalizado: false,
  },
  {
    id: 'a4', nombre: 'Cañigua granos', fuente: 'TPCA', categoria: 'Cereales y tubérculos',
    energia: 340, proteinas: 14.3, grasas: 4.7, carbohidratos: 60.2, fibra: 5.5,
    calcio: 120, hierro: 9.8, esPersonalizado: false,
  },
  {
    id: 'a5', nombre: 'Lúcuma fresca', fuente: 'TPCA', categoria: 'Frutas',
    energia: 99, proteinas: 1.5, grasas: 0.5, carbohidratos: 24.2, fibra: 2.0,
    calcio: 16, vitaminaC: 8, esPersonalizado: false,
  },
  {
    id: 'a6', nombre: 'Camu camu', fuente: 'TPCA', categoria: 'Frutas',
    energia: 17, proteinas: 0.5, grasas: 0.2, carbohidratos: 3.6, fibra: 0.5,
    vitaminaC: 2780, esPersonalizado: false,
  },
  {
    id: 'a7', nombre: 'Aguaje pulpa', fuente: 'TPCA', categoria: 'Frutas',
    energia: 141, proteinas: 1.4, grasas: 6.8, carbohidratos: 20.3, fibra: 4.5,
    vitaminaC: 25, esPersonalizado: false,
  },
  {
    id: 'a8', nombre: 'Olluco cocido', fuente: 'TPCA', categoria: 'Verduras',
    energia: 61, proteinas: 1.1, grasas: 0.1, carbohidratos: 14.3, fibra: 1.0,
    vitaminaC: 12, esPersonalizado: false,
  },
  {
    id: 'a9', nombre: 'Trucha fresca', fuente: 'TPCA', categoria: 'Pescados y mariscos',
    energia: 119, proteinas: 19.2, grasas: 4.3, carbohidratos: 0, fibra: 0,
    calcio: 14, hierro: 0.6, esPersonalizado: false,
  },
  {
    id: 'a10', nombre: 'Cuy cocido', fuente: 'TPCA', categoria: 'Carnes y aves',
    energia: 182, proteinas: 21.3, grasas: 10.8, carbohidratos: 0, fibra: 0,
    hierro: 2.4, esPersonalizado: false,
  },
  // ── SMAE (México) ──
  {
    id: 'a11', nombre: 'Leche descremada', fuente: 'SMAE', categoria: 'Lácteos y huevos',
    energia: 36, proteinas: 3.6, grasas: 0.1, carbohidratos: 5.1, fibra: 0,
    calcio: 125, sodio: 44, esPersonalizado: false,
  },
  {
    id: 'a12', nombre: 'Pechuga de pollo', fuente: 'SMAE', categoria: 'Carnes y aves',
    energia: 165, proteinas: 31.0, grasas: 3.6, carbohidratos: 0, fibra: 0,
    sodio: 74, hierro: 1.0, esPersonalizado: false,
  },
  {
    id: 'a13', nombre: 'Arroz blanco cocido', fuente: 'SMAE', categoria: 'Cereales y tubérculos',
    energia: 130, proteinas: 2.7, grasas: 0.3, carbohidratos: 28.2, fibra: 0.4,
    sodio: 1, esPersonalizado: false,
  },
  {
    id: 'a14', nombre: 'Frijol negro cocido', fuente: 'SMAE', categoria: 'Leguminosas',
    energia: 132, proteinas: 8.9, grasas: 0.5, carbohidratos: 23.7, fibra: 8.7,
    calcio: 27, hierro: 2.1, esPersonalizado: false,
  },
  {
    id: 'a15', nombre: 'Aguacate', fuente: 'SMAE', categoria: 'Frutas',
    energia: 160, proteinas: 2.0, grasas: 14.7, carbohidratos: 8.5, fibra: 6.7,
    potasio: 485, esPersonalizado: false,
  } as Alimento,
  {
    id: 'a16', nombre: 'Tortilla de maíz', fuente: 'SMAE', categoria: 'Cereales y tubérculos',
    energia: 218, proteinas: 5.7, grasas: 2.5, carbohidratos: 43.5, fibra: 5.9,
    calcio: 121, esPersonalizado: false,
  },
  {
    id: 'a17', nombre: 'Nopal cocido', fuente: 'SMAE', categoria: 'Verduras',
    energia: 22, proteinas: 1.6, grasas: 0.3, carbohidratos: 4.3, fibra: 2.0,
    calcio: 141, vitaminaC: 8, esPersonalizado: false,
  },
  {
    id: 'a18', nombre: 'Leche entera', fuente: 'SMAE', categoria: 'Lácteos y huevos',
    energia: 61, proteinas: 3.2, grasas: 3.3, carbohidratos: 4.8, fibra: 0,
    calcio: 113, sodio: 43, esPersonalizado: false,
  },
  // ── USDA (Internacional) ──
  {
    id: 'a19', nombre: 'Avena en hojuelas', fuente: 'USDA', categoria: 'Cereales y tubérculos',
    energia: 389, proteinas: 16.9, grasas: 6.9, carbohidratos: 66.3, fibra: 10.6,
    sodio: 2, hierro: 4.7, esPersonalizado: false,
  },
  {
    id: 'a20', nombre: 'Almendras', fuente: 'USDA', categoria: 'Grasas y aceites',
    energia: 579, proteinas: 21.2, grasas: 49.9, carbohidratos: 21.6, fibra: 12.5,
    calcio: 264, hierro: 3.7, esPersonalizado: false,
  },
  {
    id: 'a21', nombre: 'Manzana roja', fuente: 'USDA', categoria: 'Frutas',
    energia: 52, proteinas: 0.3, grasas: 0.2, carbohidratos: 13.8, fibra: 2.4,
    vitaminaC: 4.6, esPersonalizado: false,
  },
  {
    id: 'a22', nombre: 'Salmón atlántico', fuente: 'USDA', categoria: 'Pescados y mariscos',
    energia: 208, proteinas: 20.4, grasas: 13.4, carbohidratos: 0, fibra: 0,
    sodio: 59, calcio: 12, hierro: 0.8, esPersonalizado: false,
  },
  {
    id: 'a23', nombre: 'Espinacas crudas', fuente: 'USDA', categoria: 'Verduras',
    energia: 23, proteinas: 2.9, grasas: 0.4, carbohidratos: 3.6, fibra: 2.2,
    calcio: 99, hierro: 2.7, vitaminaC: 28, esPersonalizado: false,
  },
  {
    id: 'a24', nombre: 'Huevo entero cocido', fuente: 'USDA', categoria: 'Lácteos y huevos',
    energia: 155, proteinas: 12.6, grasas: 10.6, carbohidratos: 1.1, fibra: 0,
    sodio: 124, calcio: 50, hierro: 1.2, esPersonalizado: false,
  },
  {
    id: 'a25', nombre: 'Plátano maduro', fuente: 'USDA', categoria: 'Frutas',
    energia: 89, proteinas: 1.1, grasas: 0.3, carbohidratos: 22.8, fibra: 2.6,
    vitaminaC: 8.7, esPersonalizado: false,
  },
  {
    id: 'a26', nombre: 'Brócoli cocido', fuente: 'USDA', categoria: 'Verduras',
    energia: 35, proteinas: 2.4, grasas: 0.4, carbohidratos: 7.2, fibra: 3.3,
    calcio: 40, vitaminaC: 65, esPersonalizado: false,
  },
  {
    id: 'a27', nombre: 'Aceite de oliva extra virgen', fuente: 'USDA', categoria: 'Grasas y aceites',
    energia: 884, proteinas: 0, grasas: 100, carbohidratos: 0, fibra: 0,
    sodio: 2, esPersonalizado: false,
  },
  {
    id: 'a28', nombre: 'Yogur natural sin azúcar', fuente: 'USDA', categoria: 'Lácteos y huevos',
    energia: 59, proteinas: 3.5, grasas: 3.3, carbohidratos: 4.7, fibra: 0,
    calcio: 121, sodio: 36, esPersonalizado: false,
  },
]

/* ═══════════════════════════════════════════
   PLATILLOS MOCK
═══════════════════════════════════════════ */
export const MOCK_PLATILLOS: Platillo[] = [
  {
    id: 'pl1',
    nombre: 'Quinoto andino',
    descripcion: 'Quinua con trucha y papa amarilla al vapor',
    ingredientes: [
      { alimentoId: 'a1', alimentoNombre: 'Quinua cocida', fuente: 'TPCA', gramos: 150 },
      { alimentoId: 'a9', alimentoNombre: 'Trucha fresca', fuente: 'TPCA', gramos: 120 },
      { alimentoId: 'a2', alimentoNombre: 'Papa amarilla cocida', fuente: 'TPCA', gramos: 100 },
    ],
    porciones: 1,
    creadoEn: '2026-05-20',
  },
  {
    id: 'pl2',
    nombre: 'Bowl proteico',
    descripcion: 'Base de arroz con pechuga y brócoli',
    ingredientes: [
      { alimentoId: 'a13', alimentoNombre: 'Arroz blanco cocido', fuente: 'SMAE', gramos: 180 },
      { alimentoId: 'a12', alimentoNombre: 'Pechuga de pollo', fuente: 'SMAE', gramos: 150 },
      { alimentoId: 'a26', alimentoNombre: 'Brócoli cocido', fuente: 'USDA', gramos: 100 },
    ],
    porciones: 1,
    creadoEn: '2026-05-25',
  },
]
