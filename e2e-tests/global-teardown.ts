import { stopDocker } from './helpers/docker-manager';

/**
 * Global teardown runs once after all tests complete
 * Stops Docker containers and removes volumes for complete cleanup
 */
async function globalTeardown() {
  console.log('\n🧹 Cleaning up E2E test environment...\n');
  
  try {
    await stopDocker();
    console.log('\n✅ E2E test environment cleaned up\n');
  } catch (error) {
    console.error('\n💥 Global teardown failed:', error);
    // Don't throw - we want tests to report their results even if cleanup fails
  }
}

export default globalTeardown;
