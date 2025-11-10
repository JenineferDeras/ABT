/**
 * Figma Design Integration
 * Access Figma files and design data
 */

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: any;
  components: Record<string, any>;
  styles: Record<string, any>;
}

export async function getFigmaFile(fileKey: string): Promise<FigmaFile> {
  const token = process.env.FIGMA_TOKEN;
  
  if (!token) {
    throw new Error('FIGMA_TOKEN environment variable is not set');
  }

  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getFigmaFileNodes(
  fileKey: string,
  nodeIds: string[]
): Promise<any> {
  const token = process.env.FIGMA_TOKEN;
  
  if (!token) {
    throw new Error('FIGMA_TOKEN environment variable is not set');
  }

  const idsParam = nodeIds.join(',');
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${idsParam}`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getFigmaComments(fileKey: string): Promise<any[]> {
  const token = process.env.FIGMA_TOKEN;
  
  if (!token) {
    throw new Error('FIGMA_TOKEN environment variable is not set');
  }

  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.comments;
}

export async function postFigmaComment(
  fileKey: string,
  message: string,
  clientMeta?: { x: number; y: number; node_id?: string }
): Promise<any> {
  const token = process.env.FIGMA_TOKEN;
  
  if (!token) {
    throw new Error('FIGMA_TOKEN environment variable is not set');
  }

  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
    method: 'POST',
    headers: {
      'X-Figma-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      client_meta: clientMeta,
    }),
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
