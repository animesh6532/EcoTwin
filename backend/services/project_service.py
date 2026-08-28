import os
import json
import ast
import re
from pathlib import Path
from typing import Dict, Any, List

class ProjectService:
    def __init__(self):
        self.project_root = Path(__file__).resolve().parents[2]
        self.notebooks_dir = self.project_root / "notebooks"
        self.figures_dir = self.project_root / "reports" / "figures"
        self.models_dir = self.project_root / "models"
        
        # Cache for parsed notebook metadata
        self._notebooks_cache: Dict[str, Dict[str, Any]] = {}

    def get_project_overview(self) -> Dict[str, Any]:
        """
        Reads README.md and current health configurations to serve general details.
        """
        readme_path = self.project_root / "README.md"
        objective = "Intelligent urban traffic optimization and environmental analysis platform using SUMO, FastAPI, and Reinforcement Learning."
        
        if readme_path.exists():
            try:
                with open(readme_path, "r", encoding="utf-8") as f:
                    content = f.read()
                # Extract objective from top section
                match = re.search(r"##\s+Overview\s+([\s\S]+?)(?:##|$)", content, re.IGNORECASE)
                if match:
                    objective = match.group(1).strip()
            except Exception:
                pass
                
        # Technology Stack
        tech_stack = {
            "Core": ["HTML5", "TypeScript", "React", "Vite", "FastAPI", "Uvicorn"],
            "Styling": ["Tailwind CSS", "Lucide React", "Glassmorphism aesthetics"],
            "Simulation": ["SUMO (Simulation of Urban MObility)", "TraCI (Traffic Control Interface)"],
            "Machine Learning": ["scikit-learn", "Random Forest Regressor", "joblib"],
            "Reinforcement Learning": ["Stable-Baselines3", "Gymnasium", "PPO (Proximal Policy Optimization)"],
            "Database": ["SQLite", "SQLAlchemy ORM"]
        }
        
        # Major Subsystems
        subsystems = [
            {"name": "Microscopic Traffic Simulator", "description": "Microsecond physics-based car-following and lane-changing loops using SUMO config grids."},
            {"name": "Adaptive Signal Controller", "description": "Deep reinforcement learning policy executing closed-loop phase switches via PPO model checkpoints."},
            {"name": "Pollution Predictor", "description": "Supervised Random Forest regression predicting next-step segment CO2 emissions."},
            {"name": "Telemetry Dispatcher", "description": "WebSocket pipeline streaming live grid queues, wait times, coordinates, and hotspots in real-time."}
        ]
        
        return {
            "title": "EcoTwin Digital Twin Platform",
            "objective": objective,
            "tech_stack": tech_stack,
            "subsystems": subsystems
        }

    def list_notebooks(self) -> List[Dict[str, Any]]:
        """
        Scans directories to return all discovered notebooks and high level details.
        """
        if not self.notebooks_dir.exists():
            return []
            
        notebook_files = sorted(list(self.notebooks_dir.glob("*.ipynb")))
        results = []
        
        for nb_path in notebook_files:
            nb_id = nb_path.name
            
            # Use cached metadata if available
            if nb_id in self._notebooks_cache:
                results.append(self._notebooks_cache[nb_id]["summary"])
                continue
                
            parsed = self._parse_notebook_file(nb_path)
            if parsed:
                self._notebooks_cache[nb_id] = parsed
                results.append(parsed["summary"])
                
        return results

    def get_notebook_details(self, notebook_id: str) -> Dict[str, Any]:
        """
        Returns full parsed contents, cells, functions, classes for a notebook.
        Uses strict filename validation to prevent path traversal.
        """
        if not re.match(r"^[0-9a-zA-Z_\-\.]+\.ipynb$", notebook_id):
            raise ValueError("Invalid notebook filename format.")
            
        nb_path = self.notebooks_dir / notebook_id
        if not nb_path.exists():
            raise FileNotFoundError(f"Notebook '{notebook_id}' not found.")
            
        # Parse if not cached
        if notebook_id not in self._notebooks_cache:
            parsed = self._parse_notebook_file(nb_path)
            if parsed:
                self._notebooks_cache[notebook_id] = parsed
            else:
                raise RuntimeError(f"Failed to parse notebook '{notebook_id}'.")
                
        return self._notebooks_cache[notebook_id]["details"]

    def get_output_gallery(self) -> List[Dict[str, Any]]:
        """
        Gathers figures from reports/figures (recursive) and maps them to notebooks that reference them.
        """
        if not self.figures_dir.exists():
            return []
            
        # Discover all image files
        image_extensions = [".png", ".jpg", ".jpeg", ".svg", ".webp"]
        images_found = []
        
        for ext in image_extensions:
            images_found.extend(self.figures_dir.rglob(f"*{ext}"))
            
        notebooks = self.list_notebooks()
        gallery = []
        
        for img_path in images_found:
            rel_path = img_path.relative_to(self.project_root).as_posix()
            img_name = img_path.name
            
            # Map back to notebook by looking for references in notebook code cells
            source_notebook = "Unknown"
            source_notebook_id = None
            
            for nb in notebooks:
                nb_details = self.get_notebook_details(nb["id"])
                # Scan code sources for image references
                referenced = False
                for cell in nb_details.get("cells", []):
                    if cell.get("type") == "code":
                        source_code = cell.get("source", "")
                        if img_name in source_code or rel_path in source_code:
                            referenced = True
                            break
                if referenced:
                    source_notebook = nb["title"]
                    source_notebook_id = nb["id"]
                    break
            
            category = "Emissions" if "carbon" in rel_path or "co2" in rel_path else "Traffic"
            if "spatial" in rel_path:
                category = "Spatial Dispersal"
            elif "ppo" in rel_path or "agent" in rel_path:
                category = "Reinforcement Learning"
                
            gallery.append({
                "title": img_name.replace("_", " ").replace(".png", "").title(),
                "path": f"/api/v1/project/raw-figure/{img_name}", # Safe proxy route
                "source_notebook": source_notebook,
                "source_notebook_id": source_notebook_id,
                "category": category,
                "relative_path": rel_path
            })
            
        return gallery

    def get_models_overview(self) -> List[Dict[str, Any]]:
        """
        Reads models/artifact_registry.json and enriched metadata files to report active model configurations.
        """
        registry_path = self.models_dir / "artifact_registry.json"
        if not registry_path.exists():
            return []
            
        try:
            with open(registry_path, "r") as f:
                registry = json.load(f)
        except Exception:
            return []
            
        artifacts = registry.get("artifacts", {})
        models_list = []
        
        # Helper to check file existence
        def get_model_status(path_str: str) -> str:
            p = self.project_root / path_str
            return "Active" if p.exists() else "Missing"
            
        # 1. Preprocessor Schema
        preprocessor = artifacts.get("preprocessor", {})
        if preprocessor:
            models_list.append({
                "id": "preprocessor",
                "name": "Feature Preprocessor Schema",
                "type": "JSON Config",
                "location": preprocessor.get("path"),
                "status": get_model_status(preprocessor.get("path", "")),
                "purpose": "Validates inputs, orders features, and enforces training layout schemas.",
                "used_by": "FastAPI Lifecycle & Supervised Inference Module",
                "training_source": "02_data_cleaning_feature_engineering.ipynb"
            })
            
        # 2. Supervised ML Model
        ml_model = artifacts.get("ml_model", {})
        if ml_model:
            ml_metadata_path = self.models_dir / "ml" / "metadata.json"
            metrics = {}
            if ml_metadata_path.exists():
                try:
                    with open(ml_metadata_path, "r") as f:
                        ml_meta = json.load(f)
                    metrics = ml_meta.get("metrics", {})
                except Exception:
                    pass
            models_list.append({
                "id": "ml_model",
                "name": "Micro-Pollution Predictor",
                "type": "Random Forest Regressor (joblib)",
                "location": ml_model.get("path"),
                "status": get_model_status(ml_model.get("path", "")),
                "purpose": "Predicts next-step segment CO2 emissions based on rolling speed, waiting delays, and counts.",
                "used_by": "InferenceService static methods",
                "training_source": "05_ml_baseline.ipynb",
                "metrics": metrics
            })
            
        # 3. PPO Model
        ppo_model = artifacts.get("ppo_model", {})
        if ppo_model:
            models_list.append({
                "id": "ppo_model",
                "name": "Traffic Signal Control Policy",
                "type": "PPO Neural Network (stable-baselines3)",
                "location": ppo_model.get("path"),
                "status": get_model_status(ppo_model.get("path", "")),
                "purpose": "Chooses optimal adaptive signal configurations to balance flow and emissions.",
                "used_by": "SimulationManager closed-loop optimization step",
                "training_source": "09_ppo_training.ipynb"
            })
            
        return models_list

    def get_workflow_map(self) -> Dict[str, Any]:
        """
        Generates the dependency graph mapping out the operational pipeline.
        """
        nodes = [
            {
                "id": "data",
                "label": "Simulation Data Log",
                "purpose": "Raw vehicular records extracted from base SUMO runs.",
                "inputs": "None",
                "processing": "Microscopic position, velocity, and carbon log collections.",
                "outputs": "simulation_data.csv (1.1GB)",
                "related_files": ["data/raw/simulation_data.csv"],
                "related_notebook": "01_dataset_audit.ipynb"
            },
            {
                "id": "preprocessing",
                "label": "Data Cleaning & Engineering",
                "purpose": "Transforms raw vehicle logs into spatial-temporal segment aggregations.",
                "inputs": "simulation_data.csv",
                "processing": "Grouping logs by road segment; calculating density, flow, and rolling wait window sums.",
                "outputs": "rl_features.csv",
                "related_files": ["data/processed/rl_features.csv"],
                "related_notebook": "02_data_cleaning_feature_engineering.ipynb"
            },
            {
                "id": "ml",
                "label": "Pollution Regression",
                "purpose": "Trains regressor to forecast emissions.",
                "inputs": "rl_features.csv",
                "processing": "Random Forest regressor training with time-aware splits.",
                "outputs": "pollution_predictor.joblib",
                "related_files": ["models/ml/pollution_predictor.joblib", "backend/ml/inference_service.py"],
                "related_notebook": "05_ml_baseline.ipynb",
                "related_api": "GET /api/v1/emissions/current"
            },
            {
                "id": "env",
                "label": "Gymnasium Environment",
                "purpose": "Wraps SUMO micro-simulator into standard Gym step/reset loops.",
                "inputs": "SUMO grid networks, TraCI managers",
                "processing": "Building 8D observation spaces and computing multi-objective environment-mobility rewards.",
                "outputs": "EcoTwinEnv-v0 registered environment",
                "related_files": ["backend/rl/ecotwin_env.py", "backend/rl/reward_components.py"],
                "related_notebook": "06_ecotwin_gym_environment.ipynb"
            },
            {
                "id": "ppo",
                "label": "PPO Agent Training",
                "purpose": "Trains Neural Network policy agents to optimize signals.",
                "inputs": "Gymnasium environment",
                "processing": "Proximal Policy Optimization training with policy updates over 100,000 steps.",
                "outputs": "best_model.zip",
                "related_files": ["models/rl/ppo/best_model.zip", "backend/rl/ppo_service.py"],
                "related_notebook": "09_ppo_training.ipynb",
                "related_api": "GET /api/v1/rl/status"
            },
            {
                "id": "simulation",
                "label": "Digital Twin Operations",
                "purpose": "Real-time, interactive micro-simulation operations console.",
                "inputs": "best_model.zip, city.sumocfg",
                "processing": "Executing closed-loop PPO overrides, database snapshot logging, and WebSocket broadcasts.",
                "outputs": "ecotwin.db session records, ws_stream",
                "related_files": ["backend/simulation/manager.py", "backend/websocket/simulation_stream.py"],
                "related_api": "POST /api/v1/simulation/start",
                "related_page": "/simulation"
            }
        ]
        
        edges = [
            {"from": "data", "to": "preprocessing"},
            {"from": "preprocessing", "to": "ml"},
            {"from": "preprocessing", "to": "env"},
            {"from": "env", "to": "ppo"},
            {"from": "ml", "to": "simulation"},
            {"from": "ppo", "to": "simulation"}
        ]
        
        return {
            "nodes": nodes,
            "edges": edges
        }

    # --- Private Helpers ---
    
    def _parse_notebook_file(self, path: Path) -> Dict[str, Any]:
        """
        Parses a notebook JSON file. Extracts title, description, code imports,
        cell outputs, and lists of functions and classes defined via AST parsing.
        """
        try:
            with open(path, "r", encoding="utf-8") as f:
                nb = json.load(f)
        except Exception:
            return {}
            
        cells = nb.get("cells", [])
        if not cells:
            return {}
            
        # 1. Extract Title & Description from first cell
        title = path.name
        description = "No description available."
        
        first_cell = cells[0]
        if first_cell.get("cell_type") == "markdown":
            source_lines = first_cell.get("source", [])
            source_text = "".join(source_lines)
            
            # Find title
            title_match = re.search(r"^#+\s+(.+)$", source_lines[0].strip()) if source_lines else None
            if title_match:
                title = title_match.group(1).strip()
                # Description is everything else
                desc_text = "".join(source_lines[1:])
                # Clean markdown bold/bullets slightly
                description = desc_text.strip()
            else:
                description = source_text.strip()
                
        # Clean description markdown slightly
        description = re.sub(r"\*\*Project Objective:\*\*", "", description)
        description = re.sub(r"\*\*Purpose:\*\*", "", description)
        description = description.strip()
        
        # 2. Iterate remaining cells to find imports, functions, classes, and outputs
        all_imports = set()
        functions = []
        classes = []
        cell_outputs = []
        parsed_cells = []
        
        for idx, cell in enumerate(cells):
            cell_type = cell.get("cell_type", "code")
            source_lines = cell.get("source", [])
            source_text = "".join(source_lines)
            
            if cell_type == "markdown":
                parsed_cells.append({
                    "id": idx,
                    "type": "markdown",
                    "source": source_text
                })
                continue
                
            # Process Code cell
            # AST Extraction
            self._extract_ast_details(source_text, all_imports, functions, classes)
            
            # Extract outputs (base64 PNGs)
            cell_out_list = []
            for output in cell.get("outputs", []):
                out_type = output.get("output_type")
                if "data" in output:
                    data_obj = output["data"]
                    if "image/png" in data_obj:
                        base64_img = data_obj["image/png"].strip().replace("\n", "")
                        img_payload = f"data:image/png;base64,{base64_img}"
                        cell_out_list.append({
                            "type": "image",
                            "data": img_payload
                        })
                    elif "text/plain" in data_obj:
                        cell_out_list.append({
                            "type": "text",
                            "data": "".join(data_obj["text/plain"])
                        })
                elif out_type == "stream" and "text" in output:
                    cell_out_list.append({
                        "type": "text",
                        "data": "".join(output["text"])
                    })
                    
            cell_outputs.extend(cell_out_list)
            parsed_cells.append({
                "id": idx,
                "type": "code",
                "source": source_text,
                "outputs": cell_out_list
            })
            
        summary = {
            "id": path.name,
            "title": title,
            "description": description[:180] + "..." if len(description) > 180 else description,
            "functions_count": len(functions),
            "classes_count": len(classes),
            "outputs_count": len(cell_outputs),
            "imports": sorted(list(all_imports))[:6] # Top 6 imports
        }
        
        details = {
            "id": path.name,
            "title": title,
            "description": description,
            "imports": sorted(list(all_imports)),
            "functions": functions,
            "classes": classes,
            "cells": parsed_cells,
            "outputs": cell_outputs
        }
        
        return {
            "summary": summary,
            "details": details
        }

    def _extract_ast_details(self, code_str: str, imports_set: set, functions_list: list, classes_list: list):
        """
        Parses python code via AST to extract function signatures, classes, methods, docstrings and imports.
        Safely ignores IPython/Jupyter magics.
        """
        # Clean Jupyter magics (%, !) which AST cannot compile
        clean_lines = []
        for line in code_str.splitlines():
            if line.strip().startswith(("%", "!")):
                continue
            clean_lines.append(line)
        cleaned_code = "\n".join(clean_lines)
        
        try:
            root = ast.parse(cleaned_code)
        except Exception:
            return  # Fail silently if syntactically incomplete snippet
            
        for node in ast.walk(root):
            # Imports
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports_set.add(name.name.split(".")[0])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports_set.add(node.module.split(".")[0])
                    
            # Functions
            elif isinstance(node, ast.FunctionDef):
                # We prioritize top-level notebook helper functions
                args = [arg.arg for arg in node.args.args]
                docstring = ast.get_docstring(node) or "No documentation."
                
                # Deduplicate by function name
                if not any(f["name"] == node.name for f in functions_list):
                    functions_list.append({
                        "name": node.name,
                        "arguments": args,
                        "docstring": docstring.strip()
                    })
                    
            # Classes
            elif isinstance(node, ast.ClassDef):
                methods = []
                for subnode in node.body:
                    if isinstance(subnode, ast.FunctionDef):
                        method_args = [arg.arg for arg in subnode.args.args]
                        method_doc = ast.get_docstring(subnode) or "No documentation."
                        methods.append({
                            "name": subnode.name,
                            "arguments": method_args,
                            "docstring": method_doc.strip()
                        })
                docstring = ast.get_docstring(node) or "No documentation."
                
                if not any(c["name"] == node.name for c in classes_list):
                    classes_list.append({
                        "name": node.name,
                        "docstring": docstring.strip(),
                        "methods": methods
                    })

project_service = ProjectService()
