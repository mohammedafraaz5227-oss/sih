/**
 * HTTP Client to communicate with the FastAPI CP-SAT Optimization Service.
 * Uses native Node 18+ global fetch (zero extra dependencies).
 */

const OPTIMIZER_BASE_URL = process.env.OPTIMIZER_URL || 'http://127.0.0.1:8000';

export interface OptimizationRequestPayload {
  assets: any[];
  trains: any[];
  block_requests: any[];
  resources?: any[];
  config?: Record<string, any>;
}

export class OptimizerClient {
  private baseUrl: string;

  constructor(baseUrl: string = OPTIMIZER_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Optimizer health check failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<{ status: string; service: string }>;
  }

  async optimize(payload: OptimizationRequestPayload): Promise<any> {
    const response = await fetch(`${this.baseUrl}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Optimization failed: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  async optimizeDemo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/optimize/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Demo optimization failed: ${response.statusText}`);
    }
    return response.json();
  }

  async optimizeCongested(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/optimize/congested`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Congested optimization failed: ${response.statusText}`);
    }
    return response.json();
  }

  async compareCongested(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/compare/congested`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Congested comparison failed: ${response.statusText}`);
    }
    return response.json();
  }

  async compare(payload: OptimizationRequestPayload): Promise<any> {
    const response = await fetch(`${this.baseUrl}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Comparison failed: ${response.status} - ${errorText}`);
    }
    return response.json();
  }
}
