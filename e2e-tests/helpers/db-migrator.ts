import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DB_CONTAINER = 'supabase-db';
const POSTGRES_DB = 'postgres';
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');
const SETUP_DATA_FOLDER = path.resolve(process.cwd(), 'supabase/seeds');
const TEST_DATA_FILE = path.resolve(process.cwd(), 'e2e-tests/test-data.sql');

/**
 * Execute a SQL file inside the database container using docker exec
 */
function executeSqlFile(sqlFilePath: string): void {
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Use docker exec to run psql inside the container
  // We pipe the SQL content to psql stdin
  execSync(
    `docker exec -i ${DB_CONTAINER} psql -U postgres -d ${POSTGRES_DB}`,
    {
      encoding: 'utf8',
      input: sqlContent,
      stdio: 'pipe',
    },
  );
}

/**
 * Apply all migrations in chronological order
 */
export async function applyMigrations(): Promise<void> {
  console.log('📦 Applying database migrations...');

  // Get all migration files sorted by filename (which includes timestamp)
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.warn('⚠️  No migration files found');
    return;
  }

  console.log(`   Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);

    try {
      executeSqlFile(filePath);
      console.log(`   ✅ Applied: ${file}`);
    } catch (error) {
      console.error(`   ❌ Failed to apply: ${file}`);
      throw error;
    }
  }

  console.log('✅ All migrations applied successfully');
}

/**
 * Seed the database with test data
 */
export async function seedTestData(): Promise<void> {
  console.log('🌱 Seeding test data...');

  if (!fs.existsSync(TEST_DATA_FILE)) {
    console.warn('⚠️  Test data file not found, skipping seed');
    return;
  }

  try {
    executeSqlFile(TEST_DATA_FILE);
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed test data');
    throw error;
  }
}

/**
 * Seed the database with setup data
 */
export async function seedSetupData(): Promise<void> {
  console.log('🌱 Seeding setup data...');

  if (!fs.existsSync(SETUP_DATA_FOLDER)) {
    console.warn('⚠️  Setup data folder not found, skipping seed');
    return;
  }

  const setupFiles: string[] = findSqlFiles(SETUP_DATA_FOLDER);
  if (setupFiles.length === 0) {
    console.warn('⚠️  No setup data files found, skipping setup seed');
    return;
  }

  for (const file of setupFiles) {
    const filePath = path.join(SETUP_DATA_FOLDER, file);

    try {
      executeSqlFile(filePath);
      console.log(`   ✅ Seeded: ${file}`);
    } catch (error) {
      console.error(`   ❌ Failed to seed: ${file}`);
      throw error;
    }
  }

}

function findSqlFiles(dir: string) {
  const files = fs.readdirSync(dir);
  const setupFiles: string[] = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      setupFiles.push(...findSqlFiles(fullPath));
    } else if (stat.isFile() && file.endsWith('.sql')) {
      setupFiles.push(path.relative(SETUP_DATA_FOLDER, fullPath));
    }
  }
  return setupFiles;
}