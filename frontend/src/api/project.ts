import { apiClient, handleApiError } from "./client";

export interface ProjectOverview {
  title: string;
  objective: string;
  tech_stack: Record<string, string[]>;
  subsystems: { name: string; description: string }[];
}

export interface WorkflowNode {
  id: string;
  label: string;
  purpose: string;
  inputs: string;
  processing: string;
  outputs: string;
  related_files: string[];
  related_notebook?: string;
  related_api?: string;
  related_page?: string;
}

export interface WorkflowMap {
  nodes: WorkflowNode[];
  edges: { from: string; to: string }[];
}

export interface NotebookSummary {
  id: string;
  title: string;
  description: string;
  functions_count: number;
  classes_count: number;
  outputs_count: number;
  imports: string[];
}

export interface NotebookCell {
  id: number;
  type: "markdown" | "code";
  source: string;
  outputs: { type: "image" | "text"; data: string }[];
}

export interface NotebookDetails {
  id: string;
  title: string;
  description: string;
  imports: string[];
  functions: { name: string; arguments: string[]; docstring: string }[];
  classes: { name: string; docstring: string; methods: { name: string; arguments: string[]; docstring: string }[] }[];
  cells: NotebookCell[];
  outputs: { type: "image" | "text"; data: string }[];
}

export interface OutputGalleryItem {
  title: string;
  path: string;
  source_notebook: string;
  source_notebook_id: string | null;
  category: string;
  relative_path: string;
}

export interface ModelOverviewItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  purpose: string;
  used_by: string;
  training_source: string;
  metrics?: Record<string, number>;
}

export async function getProjectOverview(): Promise<ProjectOverview> {
  try {
    const response = await apiClient.get<ProjectOverview>("/project/overview");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectWorkflow(): Promise<WorkflowMap> {
  try {
    const response = await apiClient.get<WorkflowMap>("/project/workflow");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectNotebooks(): Promise<NotebookSummary[]> {
  try {
    const response = await apiClient.get<NotebookSummary[]>("/project/notebooks");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectNotebook(id: string): Promise<NotebookDetails> {
  try {
    const response = await apiClient.get<NotebookDetails>(`/project/notebooks/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectOutputs(): Promise<OutputGalleryItem[]> {
  try {
    const response = await apiClient.get<OutputGalleryItem[]>("/project/outputs");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getProjectModels(): Promise<ModelOverviewItem[]> {
  try {
    const response = await apiClient.get<ModelOverviewItem[]>("/project/models");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
