import { execSync } from 'node:child_process';
import path from 'node:path';

import config from '../../package.json'

const COMPOSE_FILE = path.resolve(process.cwd(), 'supabase-selfhosted/docker-compose.yml');
const COMPOSE_PROJECT = `${config.name}-e2e-tests`;

/**
 * Start the self-hosted Supabase Docker Compose stack
 */
export async function startDocker(): Promise<void> {
  console.log('🐳 Starting self-hosted Supabase Docker containers...');

  try {
    execSync(
      `docker compose -f "${COMPOSE_FILE}" -p ${COMPOSE_PROJECT} up -d`,
      {
        cwd: process.cwd(),
        stdio: 'inherit',
      },
    );
    console.log('✅ Docker containers started successfully');
  } catch (error) {
    console.error('❌ Failed to start Docker containers');
    throw error;
  }
}

/**
 * Stop the Docker Compose stack and remove volumes for complete cleanup
 */
export async function stopDocker(): Promise<void> {
  console.log('🛑 Stopping Docker containers and removing volumes...');

  try {
    execSync(
      `docker compose -f "${COMPOSE_FILE}" -p ${COMPOSE_PROJECT} down -v`,
      {
        cwd: process.cwd(),
        stdio: 'inherit',
      },
    );
    console.log('✅ Docker containers stopped and volumes removed');
  } catch (error) {
    console.error('❌ Failed to stop Docker containers');
    throw error;
  }
}

/**
 * Check if Docker Compose services are running
 */
export function checkDockerStatus(): boolean {
  try {
    const output = execSync(
      `docker compose -f "${COMPOSE_FILE}" -p ${COMPOSE_PROJECT} ps --services --filter "status=running"`,
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      },
    );

    const runningServices = output.trim().split('\n')
      .filter(s => s.length > 0);
    return runningServices.length > 0;
  } catch {
    return false;
  }
}
