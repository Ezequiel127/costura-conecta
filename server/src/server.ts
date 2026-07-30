import { createApp } from './app.js';
import { loadEnvironment } from './config/env.js';

const environment = loadEnvironment();
const app = createApp({ environment });

app.listen(environment.PORT, () => {
  console.log(
    `CosturaConecta API disponível na porta ${environment.PORT}.`
  );
});
