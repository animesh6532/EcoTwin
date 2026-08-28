import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  GitBranch, 
  Cpu, 
  Network, 
  ChevronRight, 
  BookOpen, 
  Layout, 
  Compass, 
  Image as ImageIcon,
  CheckCircle2,
  ZoomIn,
  X
} from "lucide-react";
import { 
  getProjectOverview, 
  getProjectWorkflow, 
  getProjectNotebooks, 
  getProjectNotebook, 
  getProjectOutputs, 
  getProjectModels, 
  NotebookSummary,
  OutputGalleryItem,
  ModelOverviewItem,
  WorkflowNode
} from "../api/project";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassTable } from "../components/glass/GlassTable";
import { GlassStatus } from "../components/glass/GlassStatus";

type TabId = "overview" | "workflow" | "notebooks" | "gallery" | "models" | "api";

export default function ProjectInsights() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  
  // Notebook Details overlay states
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  
  // Gallery Zoom Lightbox states
  const [zoomedImage, setZoomedImage] = useState<OutputGalleryItem | null>(null);

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["projectOverview"],
    queryFn: getProjectOverview,
  });

  const { data: workflow, isLoading: loadingWorkflow } = useQuery({
    queryKey: ["projectWorkflow"],
    queryFn: getProjectWorkflow,
  });

  const { data: notebooks, isLoading: loadingNotebooks } = useQuery({
    queryKey: ["projectNotebooks"],
    queryFn: getProjectNotebooks,
  });

  const { data: gallery, isLoading: loadingGallery } = useQuery({
    queryKey: ["projectOutputs"],
    queryFn: getProjectOutputs,
  });

  const { data: models, isLoading: loadingModels } = useQuery({
    queryKey: ["projectModels"],
    queryFn: getProjectModels,
  });

  // Selected Notebook Query
  const { data: activeNotebook, isLoading: loadingActiveNotebook } = useQuery({
    queryKey: ["projectNotebook", selectedNotebookId],
    queryFn: () => getProjectNotebook(selectedNotebookId!),
    enabled: !!selectedNotebookId,
  });

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: Layout },
    { id: "workflow", label: "Workflow Pipeline", icon: GitBranch },
    { id: "notebooks", label: "Notebook Explorer", icon: BookOpen },
    { id: "gallery", label: "Figure Gallery", icon: ImageIcon },
    { id: "models", label: "Model Registry", icon: Cpu },
    { id: "api", label: "API Map", icon: Network },
  ] as const;

  // Selected Workflow node detail overlay
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Gallery filter state
  const [galleryFilter, setGalleryFilter] = useState<string>("All");

  return (
    <div className="space-y-8 animate-fade-in text-text-cream relative pb-16">
      
      {/* Lightbox Zoom Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-[#050505]/92 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-[#120D09] border border-brand-orange/20 rounded-[28px] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-[#050505]/85 border border-white/5 rounded-full text-text-muted hover:text-brand-orange transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Image side */}
            <div className="flex-1 bg-[#050505]/50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[rgba(255,183,106,0.12)]">
              <img 
                src={zoomedImage.path} 
                alt={zoomedImage.title}
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            
            {/* Metadata side */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-2.5 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20 font-mono text-[9px] uppercase tracking-wider font-bold">
                  {zoomedImage.category}
                </span>
                
                <h3 className="text-xl font-bold uppercase tracking-tight text-text-cream font-sans">{zoomedImage.title}</h3>
                
                <p className="text-xs text-text-pale leading-relaxed font-sans">
                  This figure represents evaluation variables compiled directly during the micro-simulation iterations or baseline models training.
                </p>
                
                <div className="space-y-2 border-t border-[rgba(255,183,106,0.12)] pt-4 font-mono text-[10px] text-text-muted">
                  <div className="flex justify-between">
                    <span>Source notebook:</span>
                    <span className="text-brand-amber font-bold text-right">{zoomedImage.source_notebook}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File path:</span>
                    <span className="text-[#FFF7ED] font-mono text-[9px] text-right truncate max-w-[160px]">{zoomedImage.relative_path}</span>
                  </div>
                </div>
              </div>

              {zoomedImage.source_notebook_id && (
                <GlassButton
                  onClick={() => {
                    setSelectedNotebookId(zoomedImage.source_notebook_id);
                    setZoomedImage(null);
                    setActiveTab("notebooks");
                  }}
                  variant="primary"
                  size="sm"
                  className="w-full uppercase font-mono tracking-widest text-[9px]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Open Source Notebook</span>
                </GlassButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: "#FFF8F0",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 18px rgba(0,0,0,0.45)"
            }}
            className="uppercase font-sans leading-tight"
          >
            Project Insights
          </h1>
          <p className="text-[#E8D7C5] text-sm mt-2 leading-relaxed max-w-xl font-sans font-normal">
            Bridge workspace mapping the research notebooks, mathematical frameworks, and machine learning architectures onto the EcoTwin platform.
          </p>
        </div>
        
        {/* Workspace status */}
        <div className="flex flex-wrap items-center gap-3">
          <GlassStatus label="WORKSPACE" status="CONNECTED" />
          <GlassStatus label="NOTEBOOKS" status={notebooks ? `${notebooks.length} Discovered` : "Loading..."} />
        </div>
      </div>

      {/* Tab Switcher Capsule */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <div 
          style={{ 
            background: "rgba(25, 20, 16, 0.45)", 
            borderColor: "rgba(255, 184, 77, 0.12)",
            backdropFilter: "blur(12px)"
          }}
          className="flex border rounded-2xl p-1.5 w-max gap-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedNotebookId(null);
                  setSelectedNode(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-brand-orange text-[#120D09] font-bold shadow-[0_4px_16px_rgba(255,138,0,0.25)]" 
                    : "text-text-muted hover:text-text-cream hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Content */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {loadingOverview ? (
            <div className="h-64 rounded-2xl shimmer animate-pulse border border-white/5" />
          ) : overview ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Objective & Subsystems */}
              <div className="lg:col-span-2 space-y-6">
                <GlassPanel className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand-orange border-b border-[rgba(255,183,106,0.12)] pb-3">Project Objective</h3>
                  <p className="text-sm text-text-pale leading-relaxed font-sans font-normal whitespace-pre-line">
                    {overview.objective}
                  </p>
                </GlassPanel>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-text-muted">Core Subsystems</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.subsystems.map((sub, idx) => (
                      <GlassCard key={idx} variant="small" className="p-5 space-y-2">
                        <div className="flex items-center gap-2 text-brand-amber font-mono font-bold text-xs uppercase">
                          <CheckCircle2 className="h-4.5 w-4.5 text-brand-orange" />
                          <span>{sub.name}</span>
                        </div>
                        <p className="text-xs text-text-pale leading-relaxed font-sans">
                          {sub.description}
                        </p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tech Stack capsule */}
              <GlassCard variant="large" className="space-y-6">
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted border-b border-[rgba(255,183,106,0.12)] pb-3">Technology Stack</h3>
                
                <div className="space-y-4">
                  {Object.entries(overview.tech_stack).map(([category, techs]) => (
                    <div key={category} className="space-y-2">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted font-mono block">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {techs.map((tech) => (
                          <span key={tech} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-[#FFF8F0] tracking-wide">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>
          ) : (
            <div className="py-24 text-center border border-white/5 rounded-2xl">Failed to load overview data.</div>
          )}
        </div>
      )}

      {/* 2. WORKFLOW TAB */}
      {activeTab === "workflow" && (
        <div className="space-y-6 animate-fade-in">
          {loadingWorkflow ? (
            <div className="h-64 rounded-2xl shimmer border border-white/5" />
          ) : workflow ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Interactive pipeline graph */}
              <div className="lg:col-span-2 space-y-4">
                <GlassPanel className="p-6 min-h-[480px] flex flex-col justify-between">
                  <div className="space-y-2 border-b border-[rgba(255,183,106,0.12)] pb-3 mb-6">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted font-bold block">Interactive Dependency Map</span>
                    <h3 className="text-xs font-bold uppercase font-mono text-brand-orange">Pipeline Node Flow</h3>
                  </div>

                  {/* Visual Node Grid */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-6 py-6 font-mono text-[10px]">
                    {workflow.nodes.map((node, idx) => {
                      const isSelected = selectedNode?.id === node.id;
                      
                      return (
                        <div key={node.id} className="w-full max-w-md flex flex-col items-center relative">
                          <button
                            onClick={() => setSelectedNode(node)}
                            style={isSelected ? { borderColor: "#FF8A00", background: "rgba(255,138,0,0.08)", boxShadow: "0 0 15px rgba(255,138,0,0.18)" } : {}}
                            className={`w-full p-4 border border-[rgba(255,184,77,0.16)] bg-white/5 rounded-xl hover:border-brand-orange/50 transition-all text-left flex items-center justify-between cursor-pointer`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-center flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-text-cream font-mono uppercase tracking-wider">{node.label}</div>
                                <div className="text-[8px] text-text-muted mt-0.5 font-sans leading-normal">{node.purpose}</div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[#A9947D]" />
                          </button>

                          {/* Arrow down connector */}
                          {idx < workflow.nodes.length - 1 && (
                            <span className="h-6 w-0.5 bg-brand-orange/20 my-1.5 block animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </GlassPanel>
              </div>

              {/* Node Drawer / Info Detail Panel */}
              <GlassCard variant="large" className="min-h-[480px] flex flex-col justify-between">
                {selectedNode ? (
                  <div className="space-y-5">
                    <div className="space-y-1.5 border-b border-[rgba(255,183,106,0.12)] pb-3">
                      <span className="text-[8px] font-bold tracking-widest text-[#FF8A00] font-mono block">Node Detail Information</span>
                      <h4 className="text-base font-black text-[#FFF7ED] uppercase tracking-wider font-mono">{selectedNode.label}</h4>
                    </div>

                    <div className="space-y-4 font-mono text-[10px]">
                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold tracking-wider">Purpose:</span>
                        <p className="text-[#D6C3AE] font-sans text-xs leading-relaxed">{selectedNode.purpose}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold tracking-wider">Inputs:</span>
                        <p className="text-[#FFF7ED] font-mono">{selectedNode.inputs}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold tracking-wider">Processing:</span>
                        <p className="text-[#D6C3AE] font-sans text-xs leading-relaxed">{selectedNode.processing}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-text-muted uppercase font-bold tracking-wider">Outputs:</span>
                        <p className="text-[#FFF7ED] font-mono">{selectedNode.outputs}</p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <span className="text-text-muted uppercase font-bold tracking-wider">Related Files:</span>
                        <div className="flex flex-col gap-1 mt-1 font-mono text-[9px]">
                          {selectedNode.related_files.map((file) => (
                            <span key={file} className="text-[#FFF7ED] truncate">{file}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-[rgba(255,183,106,0.12)]">
                      {selectedNode.related_notebook && (
                        <GlassButton
                          onClick={() => {
                            setSelectedNotebookId(selectedNode.related_notebook!);
                            setActiveTab("notebooks");
                          }}
                          variant="secondary"
                          size="sm"
                          className="w-full font-mono text-[9px] uppercase tracking-widest"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-brand-orange" />
                          <span>Open Notebook</span>
                        </GlassButton>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-text-muted text-xs font-mono py-12">
                    <Compass className="h-8 w-8 text-brand-orange animate-pulse mb-3" />
                    <span>Select a workflow node to inspect pipeline details.</span>
                  </div>
                )}
                
                <div className="text-center text-[8px] text-text-muted font-mono uppercase tracking-widest pt-4 border-t border-[rgba(255,183,106,0.12)] font-bold">
                  Pipeline Telemetry Synchronized
                </div>
              </GlassCard>

            </div>
          ) : (
            <div className="py-24 text-center border border-white/5 rounded-2xl">Failed to load workflow pipeline.</div>
          )}
        </div>
      )}

      {/* 3. NOTEBOOK EXPLORER TAB */}
      {activeTab === "notebooks" && (
        <div className="space-y-6 animate-fade-in">
          {selectedNotebookId ? (
            // Notebook detailed Cell viewer
            <div className="space-y-6">
              
              {/* Back button */}
              <GlassButton
                onClick={() => setSelectedNotebookId(null)}
                variant="secondary"
                size="sm"
                className="font-mono text-[10px] uppercase font-bold tracking-widest"
              >
                ← Back to Notebook List
              </GlassButton>

              {loadingActiveNotebook ? (
                <div className="h-64 rounded-2xl shimmer animate-pulse border border-white/5" />
              ) : activeNotebook ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* Left Column: Notebook Cell log list */}
                  <div className="lg:col-span-3 space-y-6">
                    <GlassPanel className="p-6 space-y-4">
                      <h2 className="text-2xl font-black uppercase text-[#FFF7ED] font-sans tracking-tight">{activeNotebook.title}</h2>
                      <p className="text-sm text-text-pale leading-relaxed font-sans whitespace-pre-line border-b border-[rgba(255,183,106,0.12)] pb-4">
                        {activeNotebook.description}
                      </p>

                      {/* Display cells stream */}
                      <div className="space-y-6 pt-2">
                        {activeNotebook.cells.map((cell) => {
                          const isCode = cell.type === "code";
                          
                          return (
                            <div 
                              key={cell.id} 
                              className={`p-5 rounded-2xl border ${
                                isCode 
                                  ? "bg-[#080706]/45 border-[rgba(255,184,77,0.08)] font-mono" 
                                  : "border-transparent font-sans"
                              }`}
                            >
                              <div className="flex justify-between items-center text-[8px] font-bold text-text-muted font-mono uppercase tracking-widest mb-3">
                                <span>Cell [{cell.id}]</span>
                                <span className={isCode ? "text-brand-orange" : "text-[#A9947D]"}>{cell.type}</span>
                              </div>

                              {isCode ? (
                                <pre className="text-xs text-[#FFF7ED] font-mono overflow-x-auto p-3.5 bg-[#050505] rounded-xl border border-white/5 scrollbar-thin">
                                  <code>{cell.source}</code>
                                </pre>
                              ) : (
                                <p className="text-xs text-text-pale leading-relaxed whitespace-pre-line font-normal">
                                  {cell.source.replace(/^#+\s+.+$/, "").trim()} {/* Strip duplicate headers */}
                                </p>
                              )}

                              {/* Cell output display (embedded base64 images/stdout strings) */}
                              {cell.outputs && cell.outputs.length > 0 && (
                                <div className="mt-4 border-t border-[rgba(255,183,106,0.12)] pt-4 space-y-3">
                                  {cell.outputs.map((out, oIdx) => {
                                    if (out.type === "image") {
                                      return (
                                        <div key={oIdx} className="bg-[#050505]/40 p-4 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                                          <img src={out.data} alt="Cell Output figure" className="max-h-[360px] rounded-lg" />
                                          <span className="text-[8px] font-bold text-text-muted uppercase font-mono mt-2">Embedded figure output</span>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={oIdx} className="bg-[#050505] border border-white/5 p-3 rounded-lg font-mono text-[10px] text-text-pale overflow-x-auto whitespace-pre">
                                          {out.data}
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </GlassPanel>
                  </div>

                  {/* Right Column: AST declarations list (Functions/classes/imports) */}
                  <div className="space-y-6">
                    
                    {/* Imports card */}
                    <GlassCard variant="large" className="space-y-3 font-mono text-[10px]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-[rgba(255,183,106,0.12)] pb-2.5">Imports List</h3>
                      {activeNotebook.imports.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeNotebook.imports.map((lib) => (
                            <span key={lib} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-semibold text-[9px] text-[#FFF8F0] tracking-wide">
                              {lib}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[9px] text-text-muted">No external imports found.</div>
                      )}
                    </GlassCard>

                    {/* AST Functions definitions card */}
                    <GlassCard variant="large" className="space-y-4">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-muted border-b border-[rgba(255,183,106,0.12)] pb-2.5">AST Declarations</h3>
                      
                      {activeNotebook.functions.length > 0 || activeNotebook.classes.length > 0 ? (
                        <div className="space-y-5 font-mono text-[10px]">
                          {/* Classes */}
                          {activeNotebook.classes.map((cls) => (
                            <div key={cls.name} className="space-y-2 p-2.5 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-brand-orange uppercase text-[8px] tracking-widest font-bold">Class</span>
                              <div className="font-bold text-xs text-text-cream font-mono mt-0.5">{cls.name}</div>
                              <p className="text-[9px] text-text-muted font-sans italic leading-normal mt-1">{cls.docstring}</p>
                              
                              {cls.methods.length > 0 && (
                                <div className="space-y-1.5 pl-2 border-l border-brand-orange/20 mt-2">
                                  {cls.methods.map((method) => (
                                    <div key={method.name} className="space-y-0.5 text-[9px]">
                                      <div className="font-bold text-[#FFF7ED]">{method.name}({method.arguments.join(", ")})</div>
                                      {method.docstring && <p className="text-[8px] text-text-muted font-sans truncate">{method.docstring}</p>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Functions */}
                          {activeNotebook.functions.map((fn) => (
                            <div key={fn.name} className="space-y-1.5 p-2.5 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-brand-amber uppercase text-[8px] tracking-widest font-bold">Function</span>
                              <div className="font-bold text-[#FFF7ED] font-mono break-all">{fn.name}({fn.arguments.join(", ")})</div>
                              <p className="text-[9px] text-text-muted font-sans italic leading-normal">{fn.docstring}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[9px] text-text-muted font-mono">No declarations parsed in cells.</div>
                      )}
                    </GlassCard>

                  </div>

                </div>
              ) : (
                <div className="py-24 text-center border border-white/5 rounded-2xl">Notebook details not found.</div>
              )}
            </div>
          ) : (
            // Notebooks List grid
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingNotebooks ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-56 bg-white/5 border border-white/5 rounded-3xl shimmer animate-pulse" />
                  ))
                ) : notebooks && notebooks.length > 0 ? (
                  notebooks.map((nb: NotebookSummary) => (
                    <GlassCard key={nb.id} variant="small" className="flex flex-col justify-between h-64 p-6 relative group">
                      
                      {/* Top metadata */}
                      <div className="space-y-3">
                        <span className="font-mono text-[9px] font-bold text-brand-orange uppercase tracking-wider bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20 w-max block">
                          Notebook
                        </span>
                        
                        <h4 className="text-base font-bold text-text-cream font-sans uppercase tracking-tight line-clamp-1">
                          {nb.title}
                        </h4>
                        
                        <p className="text-xs text-text-pale leading-normal font-sans line-clamp-3">
                          {nb.description}
                        </p>
                      </div>

                      {/* Summary indicator tags */}
                      <div className="space-y-4 pt-3 border-t border-[rgba(255,183,106,0.12)]">
                        <div className="flex justify-between font-mono text-[8px] text-text-muted uppercase tracking-wider font-bold">
                          <span>Functions: <span className="text-[#FFF7ED] font-mono">{nb.functions_count}</span></span>
                          <span>Classes: <span className="text-[#FFF7ED] font-mono">{nb.classes_count}</span></span>
                          <span>Outputs: <span className="text-[#FFF7ED] font-mono">{nb.outputs_count}</span></span>
                        </div>
                        
                        <GlassButton
                          onClick={() => setSelectedNotebookId(nb.id)}
                          variant="secondary"
                          size="sm"
                          className="w-full font-mono text-[9px] uppercase tracking-widest h-8"
                        >
                          Explore Notebook
                        </GlassButton>
                      </div>

                    </GlassCard>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center border border-white/5 rounded-2xl">No notebooks discovered.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. FIGURE GALLERY TAB */}
      {activeTab === "gallery" && (
        <div className="space-y-6 animate-fade-in">
          {/* Category filter buttons */}
          <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-wider font-bold">
            {["All", "Traffic", "Emissions", "Spatial Dispersal", "Reinforcement Learning"].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3 py-1.5 border rounded-full transition-all cursor-pointer ${
                  galleryFilter === cat 
                    ? "bg-brand-orange text-[#120D09] border-brand-orange font-bold" 
                    : "text-text-muted border-white/10 hover:text-text-cream hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingGallery ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-white/5 border border-white/5 rounded-3xl shimmer animate-pulse" />
              ))
            ) : gallery && gallery.length > 0 ? (
              gallery
                .filter((item: OutputGalleryItem) => galleryFilter === "All" || item.category === galleryFilter)
                .map((item: OutputGalleryItem, idx: number) => (
                  <GlassCard key={idx} variant="small" className="flex flex-col justify-between p-4 overflow-hidden group">
                    
                    {/* Image frame */}
                    <div className="relative aspect-video rounded-xl bg-[#050505]/40 overflow-hidden border border-white/5 group-hover:border-brand-orange/30 transition-all flex items-center justify-center">
                      <img 
                        src={item.path} 
                        alt={item.title} 
                        className="object-cover h-full w-full opacity-80 group-hover:opacity-95 transition-all scale-100 group-hover:scale-102"
                      />
                      
                      {/* Zoom Trigger Button */}
                      <button 
                        onClick={() => setZoomedImage(item)}
                        className="absolute inset-0 bg-[#050505]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      >
                        <span className="p-3 bg-[#120D09] border border-white/10 rounded-full text-brand-orange flex items-center justify-center shadow-lg">
                          <ZoomIn className="h-4 w-4" />
                        </span>
                      </button>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="pt-4 space-y-2">
                      <span className="text-[8px] font-bold text-text-muted font-mono uppercase tracking-widest">{item.category}</span>
                      <h4 className="text-sm font-bold text-[#FFF7ED] uppercase tracking-tight line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-text-muted font-mono flex items-center justify-between">
                        <span>Source: {item.source_notebook}</span>
                      </p>
                    </div>

                  </GlassCard>
                ))
            ) : (
              <div className="col-span-full py-24 text-center border border-white/5 rounded-2xl">No output figures mapped.</div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODEL EXPLORER TAB */}
      {activeTab === "models" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingModels ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/5 border border-white/5 rounded-3xl shimmer animate-pulse" />
              ))
            ) : models && models.length > 0 ? (
              models.map((model: ModelOverviewItem) => {
                const isActive = model.status === "Active";
                
                return (
                  <GlassCard key={model.id} variant="large" className="flex flex-col justify-between h-80 p-6 relative">
                    
                    {/* Top segment */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange border border-brand-orange/20 font-mono text-[9px] uppercase tracking-wider font-bold">
                          {model.type}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] font-bold border ${
                          isActive 
                            ? "bg-[#39D98A]/10 text-[#39D98A] border-[#39D98A]/20" 
                            : "bg-[#FFB84D]/10 text-[#FFB84D] border-[#FFB84D]/20 animate-pulse"
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-text-cream font-sans uppercase tracking-tight">{model.name}</h4>
                      
                      <p className="text-xs text-text-pale leading-relaxed font-sans line-clamp-3">
                        {model.purpose}
                      </p>
                    </div>

                    {/* Registry details */}
                    <div className="space-y-3 pt-3 border-t border-[rgba(255,183,106,0.12)] font-mono text-[9px] text-text-muted">
                      <div className="flex justify-between truncate">
                        <span>Registry Path:</span>
                        <span className="text-[#FFF7ED] font-mono text-[8px]">{model.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consumed by:</span>
                        <span className="text-[#FFF7ED] font-mono text-[8px] text-right max-w-[160px] truncate">{model.used_by}</span>
                      </div>
                      
                      {/* Metrics if Random forest */}
                      {model.metrics && Object.keys(model.metrics).length > 0 && (
                        <div className="flex justify-between border-t border-white/5 pt-1.5 text-[8px] uppercase font-bold text-[#FF8A00]">
                          <span>R² Validation Score:</span>
                          <span>{model.metrics.r2 ? (model.metrics.r2 * 100).toFixed(1) : "0.0"}%</span>
                        </div>
                      )}
                    </div>

                  </GlassCard>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center border border-white/5 rounded-2xl">No models registered.</div>
            )}
          </div>
        </div>
      )}

      {/* 6. API MAP TAB */}
      {activeTab === "api" && (
        <div className="space-y-6 animate-fade-in">
          <GlassPanel className="p-6">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-4 border-b border-[rgba(255,183,106,0.12)] pb-3">API Integration Map</h3>
            
            <GlassTable headers={["Endpoint Method", "Route Prefix", "Target Purpose", "Frontend Consumer Client"]}>
              
              {/* Endpoint Row 1 */}
              <tr className="hover:bg-brand-orange/5 text-text-cream font-mono text-xs transition-colors">
                <td className="p-4 border-none text-[#FF8A00] font-bold">POST</td>
                <td className="p-4 border-none text-[#FFF7ED] font-mono font-bold truncate">/api/v1/simulation/start</td>
                <td className="p-4 border-none text-text-pale font-sans">Configures parameters and spawns microscopical SUMO processes.</td>
                <td className="p-4 border-none text-[#A9947D] truncate">`startSimulation(config)`</td>
              </tr>

              {/* Endpoint Row 2 */}
              <tr className="hover:bg-brand-orange/5 text-text-cream font-mono text-xs transition-colors">
                <td className="p-4 border-none text-[#FF8A00] font-bold">GET</td>
                <td className="p-4 border-none text-[#FFF7ED] font-mono font-bold truncate">/api/v1/simulation/status</td>
                <td className="p-4 border-none text-text-pale font-sans">Fetches active session simulation state and run durations.</td>
                <td className="p-4 border-none text-[#A9947D] truncate">`getSimulationStatus()`</td>
              </tr>

              {/* Endpoint Row 3 */}
              <tr className="hover:bg-brand-orange/5 text-text-cream font-mono text-xs transition-colors">
                <td className="p-4 border-none text-[#FF8A00] font-bold">GET</td>
                <td className="p-4 border-none text-[#FFF7ED] font-mono font-bold truncate">/api/v1/metrics/history</td>
                <td className="p-4 border-none text-text-pale font-sans">Queries historical snapshot charts for vehicle counts, wait times.</td>
                <td className="p-4 border-none text-[#A9947D] truncate">`getHistoricalMetrics(sessionId)`</td>
              </tr>

              {/* Endpoint Row 4 */}
              <tr className="hover:bg-brand-orange/5 text-text-cream font-mono text-xs transition-colors">
                <td className="p-4 border-none text-[#FF8A00] font-bold">POST</td>
                <td className="p-4 border-none text-[#FFF7ED] font-mono font-bold truncate">/api/v1/rl/mode</td>
                <td className="p-4 border-none text-text-pale font-sans">Switches controller in real-time (Fixed-Time baseline vs PPO policy).</td>
                <td className="p-4 border-none text-[#A9947D] truncate">`setRLMode(modeConfig)`</td>
              </tr>

              {/* Endpoint Row 5 */}
              <tr className="hover:bg-brand-orange/5 text-text-cream font-mono text-xs transition-colors">
                <td className="p-4 border-none text-[#FF8A00] font-bold">GET</td>
                <td className="p-4 border-none text-[#FFF7ED] font-mono font-bold truncate">/api/v1/analysis/compare</td>
                <td className="p-4 border-none text-text-pale font-sans">Calculates percentage improvements between active PPO runs and baseline cycles.</td>
                <td className="p-4 border-none text-[#A9947D] truncate">`compareRunsAnalysis(ppo, baseline)`</td>
              </tr>

            </GlassTable>
          </GlassPanel>
        </div>
      )}

    </div>
  );
}
