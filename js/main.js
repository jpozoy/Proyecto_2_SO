import SetupScreen from './ui/SetupScreen.js';
import SimulationScreen from './ui/SimulationScreen.js';
import OperationManager from './simulation/OperationManager.js';
import SimulationEngine from './simulation/SimulationEngine.js';

const setup = new SetupScreen('setup-screen');
const sim = new SimulationScreen('simulation-screen');

setup.render();
setup.show();
sim.hide();

//  Iniciar simulación 
setup.onStart((config) => {
  const om = new OperationManager(config.seed);

  let operations;
  if (config.fileContent && config.fileContent.trim().length > 0) {
    operations = om.parseFile(config.fileContent);
  } else {
    operations = om.generate(config.P, config.N);
  }

  if (!operations || operations.length === 0) {
    alert('No se encontraron operaciones válidas para simular.');
    return;
  }

  const engine = new SimulationEngine(operations, config.algorithm);
  engine.onStepCallback = (e) => sim.update(e);
  engine.onFinishCallback = (e) => sim.onFinish(e);

  setup.hide();
  sim.show();
  sim.render(engine);
  sim.update(engine);
});

// Generar y descargar archivo de operaciones
setup.onGenerateFile((config) => {
  const om = new OperationManager(config.seed);
  om.generate(config.P, config.N);
  om.downloadFile();
});
