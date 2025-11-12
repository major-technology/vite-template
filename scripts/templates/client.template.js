export const clientTemplate = (data) => `import { ${data.clientClass} } from '../lib/resource-client/client';

/**
 * ${data.description}
 * 
 * Type: ${data.type}
 * Resource ID: ${data.resourceId}
 * Application ID: ${data.applicationId}
 * 
 * DO NOT EDIT - Auto-generated
 */

const BASE_URL = import.meta.env.MAJOR_API_BASE_URL || 'https://api.major.tech';
const MAJOR_JWT_TOKEN = import.meta.env.MAJOR_JWT_TOKEN;

class ${data.clientName}Singleton {
  private static instance: ${data.clientClass} | null = null;

  static getInstance(): ${data.clientClass} {
    if (!${data.clientName}Singleton.instance) {
      ${data.clientName}Singleton.instance = new ${data.clientClass}({
        baseUrl: BASE_URL,
        majorJwtToken: MAJOR_JWT_TOKEN,
        applicationId: '${data.applicationId}',
        resourceId: '${data.resourceId}',
      });
    }
    return ${data.clientName}Singleton.instance;
  }
}

export const ${data.clientName} = ${data.clientName}Singleton.getInstance();
`;

export const indexTemplate = (data) => `/**
 * Auto-generated client exports
 * DO NOT EDIT
 */

${data.exports.join('\n')}
`;

