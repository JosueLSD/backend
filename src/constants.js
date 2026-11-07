const ROLES = ['Administrador', 'Piloto', 'Despachador', 'Visualizador'];

// Puestos de la dotación; los valores coinciden con las categorías de la plantilla.
const PUESTOS = [
  'Pilotos',
  'Copilotos',
  'Mecanicos',
  'Coordinador Tactico',
  'Sensorista',
  'Cargomaster',
  'Artillero',
  'Otros',
];

// Campo de la dotación del vuelo -> puesto que puede ocupar.
const CAMPOS_DOTACION = {
  piloto: 'Pilotos',
  copiloto: 'Copilotos',
  mecanico: 'Mecanicos',
  coordinador: 'Coordinador Tactico',
  sensorista: 'Sensorista',
  cargomaster: 'Cargomaster',
  artillero: 'Artillero',
  otros: 'Otros',
};

module.exports = { ROLES, PUESTOS, CAMPOS_DOTACION };
