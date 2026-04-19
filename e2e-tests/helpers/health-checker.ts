import { execSync } from 'node:child_process';
import path from 'node:path';

import config from '../../package.json'

const COMPOSE_FILE = path.resolve(process.cwd(), 'supabase-selfhosted/docker-compose.yml');
const COMPOSE_PROJECT = `${config.name}-e2e-tests`;
const POLL_INTERVAL = 1000; // 1 second
const MAX_TIMEOUT = 90000; // 90 seconds

// Key services that must be healthy before tests can run
const REQUIRED_SERVICES = ['db', 'auth', 'rest', 'kong'];

/**
 * Check if a specific Docker Compose service is healthy
 */
function isServiceHealthy(serviceName: string): boolean {
  try {
    const result = execSync(
      `docker compose -f "${COMPOSE_FILE}" -p ${COMPOSE_PROJECT} ps --format json ${serviceName}`,
      {
        encoding: 'utf8',
        stdio: 'pipe',
      },
    );

    // Parse the JSON output (may be multiple lines for multiple containers)
    const lines = result.trim().split('\n')
      .filter(l => l.length > 0);
    if (lines.length === 0) return false;

    // Check if any container for this service is healthy or running
    for (const line of lines) {
      const container = JSON.parse(line);
      // Container is healthy if:
      // 1. Health is "healthy", or
      // 2. State is "running" and no healthcheck is defined
      if (container.Health === 'healthy' ||
        (container.State === 'running' && !container.Health)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Wait for all required Docker services to be healthy
 */
export async function waitForHealthy(): Promise<void> {
  console.log('🏥 Waiting for Supabase services to be healthy...');
  console.log(`   Checking services: ${REQUIRED_SERVICES.join(', ')}`);

  const startTime = Date.now();

  while (Date.now() - startTime < MAX_TIMEOUT) {
    const serviceStatuses = REQUIRED_SERVICES.map(service => ({
      healthy: isServiceHealthy(service),
      name: service,
    }));

    const allHealthy = serviceStatuses.every(s => s.healthy);

    if (allHealthy) {
      console.log('✅ All required services are healthy');
      return;
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const unhealthyServices = serviceStatuses.filter(s => !s.healthy).map(s => s.name);
    process.stdout.write(`\r   ⏳ Waiting for: ${unhealthyServices.join(', ')} (${elapsed}s elapsed)`);

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  console.log(); // New line after progress indicator
  console.error('❌ Services failed to become healthy within 90 seconds');

  // Show final status
  console.error('   Final service status:');
  for (const service of REQUIRED_SERVICES) {
    const healthy = isServiceHealthy(service);
    console.error(`     ${service}: ${healthy ? '✅' : '❌'}`);
  }

  throw new Error('Health check timeout');
}
``