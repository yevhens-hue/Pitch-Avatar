export interface CapabilityContext {
  pageUrl?: string;
  appState?: Record<string, any>;
  userPermissions?: string[];
}

export interface CapabilityParams {
  [key: string]: any;
}

export interface CapabilityResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  
  /**
   * Executes the capability.
   */
  execute(params: CapabilityParams, context: CapabilityContext): Promise<CapabilityResult>;

  /**
   * For LLM: JSON Schema of the parameters this capability accepts.
   */
  parametersSchema?: Record<string, any>;
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  register(capability: Capability) {
    this.capabilities.set(capability.id, capability);
  }

  get(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  getAll(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Returns capabilities allowed for the given context (e.g. based on page or permissions).
   */
  getAllowed(context: CapabilityContext): Capability[] {
    // Basic implementation - in the future, filter by context.userPermissions etc.
    return this.getAll();
  }
}

export const globalRegistry = new CapabilityRegistry();
