/**
 * Vercel Deployment Integration
 * Deploy and manage Vercel projects
 */

export interface VercelProject {
  id: string;
  name: string;
  framework: string;
  createdAt: number;
  updatedAt: number;
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'READY' | 'QUEUED' | 'CANCELED';
  created: number;
  ready?: number;
}

export async function getVercelProjects(): Promise<VercelProject[]> {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set');
  }

  const response = await fetch('https://api.vercel.com/v9/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.projects;
}

export async function getVercelDeployments(
  projectId?: string
): Promise<VercelDeployment[]> {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set');
  }

  const url = projectId
    ? `https://api.vercel.com/v6/deployments?projectId=${projectId}`
    : 'https://api.vercel.com/v6/deployments';

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.deployments;
}

export async function createVercelDeployment(
  projectName: string,
  files: Record<string, { file: string }>,
  environmentVariables?: Record<string, string>
): Promise<VercelDeployment> {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set');
  }

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files,
      target: 'production',
      env: environmentVariables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getVercelEnvironmentVariables(
  projectId: string
): Promise<any[]> {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set');
  }

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.envs;
}
