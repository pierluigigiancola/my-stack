import { applyMigrations, seedSetupData } from './helpers/db-migrator';
import { startDocker } from './helpers/docker-manager';
import { waitForHealthy } from './helpers/health-checker';

/**
 * Global setup runs once before all tests
 * Sets up isolated test database with self-hosted Supabase
 */
async function globalSetup() {
  console.log('🚀 Starting E2E test environment setup...\n');

  try {
    // Start Docker Compose
    await startDocker();
    console.log();

    // Wait for services to be healthy
    await waitForHealthy();
    console.log();

    // Apply migrations
    await applyMigrations();
    console.log();

    await seedSetupData();
    console.log();

    // Seed test data
    // await seedTestData();
    console.log();

    console.log('🎉 E2E test environment ready!\n');
  } catch (error) {
    console.error('\n💥 Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
