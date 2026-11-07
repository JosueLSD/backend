'use strict';

const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');

// Datos iniciales tomados de DEFAULT_DB y AIRPORTS_DB de DESPACHO.html.
// Las contraseñas se guardan en mayúsculas, igual que hace la plantilla al validar.
const USUARIOS = [
  { usuario: 'javier.perez', password: '002345', nombre: 'JAVIER PEREZ VENTURA', rol: 'Administrador', cip: '002345' },
  { usuario: 'sadyth.luque', password: '60067112', nombre: 'SADYTH LUQUE ZAPATA', rol: 'Administrador', cip: '60067112' },
  { usuario: 'juan.chavez', password: 'OO25', nombre: 'TTE 1 JUAN CHAVEZ', rol: 'Piloto', cip: '00252638' },
  { usuario: 'sebastian.cabrera', password: 'OO26', nombre: 'CDC SEBASTIAN CABRERA', rol: 'Piloto', cip: '00252639' },
  { usuario: 'daniel.delgado', password: '6006', nombre: 'T1 SEA DANIEL DELGADO', rol: 'Despachador', cip: '6006' },
  { usuario: 'pablo.ventura', password: '6002', nombre: 'OM3 SEA PABLO VENTURA', rol: 'Visualizador', cip: '6002' },
];

const TRIPULANTES = [
  { puesto: 'Pilotos', grado: 'TTE 1', nombre: 'DIEGO MORZAN', clasificacion: 'Comandante', cip: '00252638', celular: '987615314', horas: '200 HRS', funcion: 'Piloto' },
  { puesto: 'Pilotos', grado: 'TTE 1', nombre: 'BENJAMIN CHAVEZ', clasificacion: 'Copiloto', cip: '00252639', celular: '987615315', horas: '150 HRS', funcion: 'Piloto' },
  { puesto: 'Copilotos', grado: 'TTE 2', nombre: 'MARCOS SANTIVAÑEZ', clasificacion: 'Copiloto', cip: '00252640', celular: '987615316', horas: '100 HRS', funcion: 'Copiloto' },
  { puesto: 'Mecanicos', grado: 'T2 MOA', nombre: 'JOSMEL ASMAT CUTIPA', clasificacion: 'Mecanico', cip: '998889889', celular: '998889889', horas: '-', funcion: 'Mecánico' },
  { puesto: 'Coordinador Tactico', grado: 'TTE 1', nombre: 'BENJAMIN QUIROZ', clasificacion: 'TACO', cip: '00252641', celular: '987615317', horas: '150 HRS', funcion: 'Coordinador' },
  { puesto: 'Sensorista', grado: 'T2 SEA', nombre: 'EDISON DONAYRE SOTO', clasificacion: 'Sensores', cip: '998889890', celular: '998889890', horas: '-', funcion: 'Sensorista' },
  { puesto: 'Cargomaster', grado: 'T2 MOA', nombre: 'JOSMEL ASMAT CUTIPA', clasificacion: 'Carga', cip: '998889889', celular: '998889889', horas: '-', funcion: 'Carga' },
  { puesto: 'Artillero', grado: 'OM 1 ART', nombre: 'JUAN LOPEZ CRUZ', clasificacion: 'Artillero', cip: '9988898889', celular: '9988898889', horas: '-', funcion: 'Artillero' },
  { puesto: 'Otros', grado: 'T1', nombre: 'MARIO ROSSI', clasificacion: 'Observador', cip: '12345678', celular: '987654321', horas: '-', funcion: 'Observador' },
];

const AERONAVES = ['INP-574'];

const AEROPUERTOS = [
  { codigo: 'SPJC', nombre: 'Jorge Chávez - Lima', elevacion: '34 m / 113 ft', twr: '118.1 MHz', pista: '15/33' },
  { codigo: 'SPZO', nombre: 'Alejandro Velasco Astete - Cusco', elevacion: '3310 m / 10860 ft', twr: '118.1 MHz', pista: '10/28' },
  { codigo: 'SPQU', nombre: 'Alfredo Rodríguez Ballón - Arequipa', elevacion: '2560 m / 8400 ft', twr: '118.7 MHz', pista: '10/28' },
  { codigo: 'SPHI', nombre: 'José Abelardo Quiñones - Chiclayo', elevacion: '30 m / 97 ft', twr: '118.3 MHz', pista: '19/01' },
  { codigo: 'SPQT', nombre: 'Coronel FAP Francisco Secada - Iquitos', elevacion: '93 m / 306 ft', twr: '118.5 MHz', pista: '06/24' },
  { codigo: 'SPRU', nombre: 'Carlos Martínez de Pinillos - Trujillo', elevacion: '39 m / 128 ft', twr: '118.7 MHz', pista: '02/20' },
  { codigo: 'SPTN', nombre: 'Coronel FAP Carlos Ciriani - Tacna', elevacion: '469 m / 1538 ft', twr: '118.4 MHz', pista: '02/20' },
  { codigo: 'SPTU', nombre: 'Padre Aldamiz - Puerto Maldonado', elevacion: '201 m / 659 ft', twr: '118.5 MHz', pista: '01/19' },
  { codigo: 'SPST', nombre: 'Cadete FAP Guillermo del Castillo - Tarapoto', elevacion: '264 m / 868 ft', twr: '118.4 MHz', pista: '17/35' },
  { codigo: 'SPYL', nombre: 'Capitán FAP Víctor Montes - Talara', elevacion: '86 m / 282 ft', twr: '119.5 MHz', pista: '17/35' },
  { codigo: 'SPJA', nombre: 'Juan Simons Vela - Rioja', elevacion: '824 m / 2707 ft', twr: '126.9 MHz', pista: '16/34' },
  { codigo: 'SPMF', nombre: 'Mayor PNP Nancy Flores - Mazamari', elevacion: '664 m / 2180 ft', twr: '118.3 MHz', pista: '15/33' },
  { codigo: 'SPZA', nombre: 'María Reiche Neuman - Nasca', elevacion: '552 m / 1813 ft', twr: '118.1 MHz', pista: '07/25' },
  { codigo: 'SPJL', nombre: 'Inca Manco Cápac - Juliaca', elevacion: '3826 m / 12552 ft', twr: '118.1 MHz', pista: '12/30' },
  { codigo: 'SPHY', nombre: 'Andahuaylas', elevacion: '3568 m / 11706 ft', twr: '126.9 MHz', pista: '03/21' },
  { codigo: 'SPSO', nombre: 'Pisco', elevacion: '12 m / 40 ft', twr: '118.3 MHz', pista: '04/22' },
];

// Vuelo de ejemplo de DEFAULT_DB: [campo de la dotación, puesto, nombre del tripulante].
const VUELO_EJEMPLO = {
  fecha: '2026-10-10',
  aeronave: 'INP-574',
  origen: 'SPJC',
  destino: 'SPSO',
  horaSalida: '04:14',
  horaLlegada: '17:18',
  estado: 'locked',
  dotacion: [
    ['piloto', 'Pilotos', 'DIEGO MORZAN'],
    ['copiloto', 'Copilotos', 'MARCOS SANTIVAÑEZ'],
    ['mecanico', 'Mecanicos', 'JOSMEL ASMAT CUTIPA'],
    ['coordinador', 'Coordinador Tactico', 'BENJAMIN QUIROZ'],
    ['sensorista', 'Sensorista', 'EDISON DONAYRE SOTO'],
    ['cargomaster', 'Cargomaster', 'JOSMEL ASMAT CUTIPA'],
    ['artillero', 'Artillero', 'JUAN LOPEZ CRUZ'],
    ['otros', 'Otros', 'MARIO ROSSI'],
  ],
};

module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    const ahora = new Date();
    const timestamps = { created_at: ahora, updated_at: ahora };

    await queryInterface.bulkInsert(
      'usuarios',
      USUARIOS.map((u) => ({
        usuario: u.usuario,
        password_hash: bcrypt.hashSync(u.password.toUpperCase(), 10),
        nombre: u.nombre,
        rol: u.rol,
        cip: u.cip,
        ...timestamps,
      }))
    );

    // Grados y funciones ya los cargan sus migraciones; aquí solo se buscan los ids.
    const grados = await sequelize.query('SELECT id, nombre FROM grados', { type: QueryTypes.SELECT });
    const funciones = await sequelize.query('SELECT id, nombre FROM funciones', { type: QueryTypes.SELECT });

    await queryInterface.bulkInsert(
      'tripulantes',
      TRIPULANTES.map(({ grado, funcion, ...t }) => ({
        ...t,
        grado_id: grados.find((g) => g.nombre === grado)?.id ?? null,
        funcion_id: funciones.find((f) => f.nombre === funcion)?.id ?? null,
        ...timestamps,
      }))
    );

    await queryInterface.bulkInsert(
      'aeronaves',
      AERONAVES.map((codigo) => ({ codigo, activo: true, ...timestamps }))
    );

    await queryInterface.bulkInsert(
      'aeropuertos',
      AEROPUERTOS.map((a) => ({ ...a, ...timestamps }))
    );

    // Se consultan los IDs recién insertados para armar el vuelo de ejemplo.
    const aeronaves = await sequelize.query('SELECT id, codigo FROM aeronaves', { type: QueryTypes.SELECT });
    const aeropuertos = await sequelize.query('SELECT id, codigo FROM aeropuertos', { type: QueryTypes.SELECT });
    const tripulantes = await sequelize.query('SELECT id, puesto, nombre FROM tripulantes', { type: QueryTypes.SELECT });

    const idDe = (lista, criterio) => lista.find((fila) => criterio(fila))?.id ?? null;

    const dotacion = {};
    for (const [campo, puesto, nombre] of VUELO_EJEMPLO.dotacion) {
      dotacion[`${campo}_id`] = idDe(tripulantes, (t) => t.puesto === puesto && t.nombre === nombre);
    }

    await queryInterface.bulkInsert('vuelos', [
      {
        fecha: VUELO_EJEMPLO.fecha,
        hora_salida: VUELO_EJEMPLO.horaSalida,
        hora_llegada: VUELO_EJEMPLO.horaLlegada,
        estado: VUELO_EJEMPLO.estado,
        aeronave_id: idDe(aeronaves, (a) => a.codigo === VUELO_EJEMPLO.aeronave),
        origen_id: idDe(aeropuertos, (a) => a.codigo === VUELO_EJEMPLO.origen),
        destino_id: idDe(aeropuertos, (a) => a.codigo === VUELO_EJEMPLO.destino),
        ...dotacion,
        ...timestamps,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('vuelos', null, {});
    await queryInterface.bulkDelete('aeropuertos', null, {});
    await queryInterface.bulkDelete('aeronaves', null, {});
    await queryInterface.bulkDelete('tripulantes', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  },
};
