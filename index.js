// -----------------------------------------------------------------------------
// Intégration Gladys « Jour Tempo » : jours EJP, jours PP et couleur Tempo,
// depuis l'API gratuite de jourtempo.fr (sans clé ni compte).
//
// Ce fichier branche seulement le SDK sur les appareils de src/devices/.
// -----------------------------------------------------------------------------

import { GladysIntegration, logger } from '@gladysassistant/integration-sdk';
import { normalizeConfig } from './src/config.js';
import { buildDiscoveredDevices, createPoller } from './src/devices/index.js';
import { lireFichier } from './src/api.js';

const gladys = new GladysIntegration();

let config = normalizeConfig();

gladys.onScanRequest(async () => {
  await gladys.publishDiscoveredDevices(buildDiscoveredDevices(gladys, config));
});

const pollDevice = createPoller();
gladys.onPoll(async (device) => {
  await pollDevice(gladys, device, config);
});

gladys.onConfigUpdated(async (newConfig) => {
  config = normalizeConfig(newConfig);
  await gladys.publishDiscoveredDevices(buildDiscoveredDevices(gladys, config));
});

gladys.on('connected', async () => {
  try {
    config = normalizeConfig(await gladys.getConfig());
    await gladys.publishDiscoveredDevices(buildDiscoveredDevices(gladys, config));
    const essai = await lireFichier('ejp');
    if (essai) {
      await gladys.setConnectionStatus(true);
    } else {
      await gladys.setConnectionStatus(false, {
        en: 'jourtempo.fr cannot be reached for now; the integration will retry.',
        fr: "jourtempo.fr est injoignable pour l'instant ; l'intégration réessaiera.",
      });
    }
  } catch (err) {
    logger.error('Post-connection initialization failed', err);
    await gladys
      .setConnectionStatus(false, {
        en: 'Initialization failed, check the integration logs.',
        fr: "L'initialisation a échoué, consultez les logs de l'intégration.",
      })
      .catch(() => {});
  }
});

gladys.handleShutdown((signal) => {
  logger.info(`Received ${signal} -> graceful shutdown`);
});

logger.info('Starting the Jour Tempo integration...');
gladys.connect().catch((err) => {
  logger.error('Initial connection failed', err);
  process.exit(1);
});
