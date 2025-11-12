#!/usr/bin/env node
/**
 * Script to generate singleton resource clients
 * 
 * Usage:
 *   node generate-clients.mjs add <resource_id> <name> <type> <description> <application_id>
 *   node generate-clients.mjs remove <name>
 *   node generate-clients.mjs list
 * 
 * Types: postgres | custom-api | hubspot | s3
 * 
 * Examples:
 *   node generate-clients.mjs add "abc-123" "orders-db" "postgres" "Orders database" "app-123"
 *   node generate-clients.mjs add "xyz-789" "payment-api" "custom-api" "Payment API" "app-456"
 *   node generate-clients.mjs remove "orders-db"
 *   node generate-clients.mjs list
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { clientTemplate, indexTemplate } from './templates/client.template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const resourcesConfigPath = path.join(projectRoot, 'resources.json');
const clientsDir = path.join(projectRoot, 'src', 'clients');

/**
 * Load resources from JSON config file
 */
function loadResources() {
  if (!fs.existsSync(resourcesConfigPath)) {
    return [];
  }
  const content = fs.readFileSync(resourcesConfigPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save resources to JSON config file
 */
function saveResources(resources) {
  const dir = path.dirname(resourcesConfigPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resourcesConfigPath, JSON.stringify(resources, null, 2), 'utf-8');
}

/**
 * Convert a resource name to a valid camelCase identifier
 * e.g., "yo mama" -> "yoMama", "orders-db" -> "ordersDb"
 */
function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[^a-z]+/, ''); // Remove leading non-letters
}

function getClientClass(type) {
  const typeMap = {
    'postgres': 'PostgresResourceClient',
    'custom-api': 'CustomApiResourceClient',
    'hubspot': 'HubSpotResourceClient',
    's3': 'S3ResourceClient',
  };
  return typeMap[type] || 'PostgresResourceClient';
}

function generateClientFile(resource) {
  const clientName = toCamelCase(resource.name) + 'Client';
  const clientClass = getClientClass(resource.type);

  return clientTemplate({
    clientClass,
    description: resource.description,
    type: resource.type,
    resourceId: resource.id,
    applicationId: resource.applicationId,
    clientName,
  });
}

function generateIndexFile(resources) {
  if (resources.length === 0) {
    return `// No clients configured\n`;
  }

  const exports = resources.map(resource => {
    const clientName = toCamelCase(resource.name) + 'Client';
    const fileName = toCamelCase(resource.name);
    return `export { ${clientName} } from './${fileName}';`;
  });

  return indexTemplate({ exports });
}

function addResource(resourceId, name, type, description, applicationId) {
  const validTypes = ['postgres', 'custom-api', 'hubspot', 's3'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid type: ${type}`);
    console.log(`   Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  if (!applicationId) {
    console.error('❌ Application ID is required');
    process.exit(1);
  }

  const resources = loadResources();
  
  const existing = resources.find(r => r.name === name);
  if (existing) {
    console.error(`❌ Resource with name "${name}" already exists`);
    process.exit(1);
  }
  
  const newResource = {
    id: resourceId,
    name,
    type,
    description,
    applicationId
  };
  
  resources.push(newResource);
  saveResources(resources);
  
  console.log(`✅ Added resource: ${name}`);
  console.log(`   Type: ${type}`);
  console.log(`   ID: ${resourceId}`);
  
  regenerateClients(resources);
}

/**
 * Remove a resource by name
 */
function removeResource(name) {
  const resources = loadResources();
  const index = resources.findIndex(r => r.name === name);
  
  if (index === -1) {
    console.error(`❌ Resource "${name}" not found`);
    process.exit(1);
  }
  
  const removed = resources.splice(index, 1)[0];
  saveResources(resources);
  
  console.log(`✅ Removed resource: ${removed.name}`);
  console.log(`   ID: ${removed.id}`);
  
  regenerateClients(resources);
}

/**
 * List all resources
 */
function listResources() {
  const resources = loadResources();
  
  if (resources.length === 0) {
    console.log('No resources configured');
    return;
  }
  
  console.log(`Resources (${resources.length}):\n`);
  resources.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.name} (${r.type})`);
    console.log(`   ID: ${r.id}`);
    console.log(`   Client: ${toCamelCase(r.name)}Client`);
    console.log('');
  });
}

/**
 * Regenerate all client files
 */
function regenerateClients(resources) {
  // Ensure clients directory exists
  if (!fs.existsSync(clientsDir)) {
    fs.mkdirSync(clientsDir, { recursive: true });
  }

  // Clear existing client files (except index.ts temporarily)
  const existingFiles = fs.readdirSync(clientsDir).filter(f => f !== 'index.ts');
  existingFiles.forEach(file => {
    fs.unlinkSync(path.join(clientsDir, file));
  });

  // Generate individual client files
  resources.forEach(resource => {
    const fileName = toCamelCase(resource.name) + '.ts';
    const filePath = path.join(clientsDir, fileName);
    const code = generateClientFile(resource);
    fs.writeFileSync(filePath, code, 'utf-8');
  });

  // Generate index file
  const indexPath = path.join(clientsDir, 'index.ts');
  const indexCode = generateIndexFile(resources);
  fs.writeFileSync(indexPath, indexCode, 'utf-8');

  console.log('Generated clients');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Usage:');
    console.log('  add <resource_id> <name> <type> <description> <application_id>');
    console.log('  remove <name>');
    console.log('  list');
    console.log('\nTypes: postgres | custom-api | hubspot | s3');
    return;
  }
  
  switch (command) {
    case 'add': {
      const [, resourceId, name, type, description, applicationId] = args;
      if (!resourceId || !name || !type || !description || !applicationId) {
        console.error('Missing arguments');
        console.log('Usage: add <resource_id> <name> <type> <description> <application_id>');
        process.exit(1);
      }
      addResource(resourceId, name, type, description, applicationId);
      break;
    }
    
    case 'remove': {
      const [, name] = args;
      if (!name) {
        console.error('Missing name');
        process.exit(1);
      }
      removeResource(name);
      break;
    }
    
    case 'list': {
      listResources();
      break;
    }
    
    case 'regenerate': {
      const resources = loadResources();
      regenerateClients(resources);
      break;
    }
    
    default: {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  }
}

main();

