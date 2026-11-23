import React, { useState, useEffect, useRef } from 'react';
import { Network, Search, Filter, RotateCcw, AlertTriangle, Layers, Info, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Network as VisNetwork, DataSet as VisDataSet } from 'vis-network/standalone/esm/vis-network.mjs';

export default function ScamGraph() {
  const containerRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [networkInstance, setNetworkInstance] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // ALL, case, upi, phone, domain

  useEffect(() => {
    // Fetch backend relationship graph
    fetch('/api/intel/graph')
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load graph:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current && graphData.nodes && graphData.nodes.length > 0) {
      try {
        const filteredNodes = graphData.nodes.filter((n) => {
          if (filterType === 'ALL') return true;
          return n.type === filterType;
        });

        const activeNodeIds = new Set(filteredNodes.map((n) => n.id));

        const filteredEdges = graphData.edges.filter(
          (e) => activeNodeIds.has(e.from) && activeNodeIds.has(e.to)
        );

        const visNodes = filteredNodes.map((n) => {
          let color = '#0284C7';
          let shape = 'dot';
          let size = 18;

          if (n.type === 'case') {
            color = n.risk === 'HIGH' ? '#EF4444' : n.risk === 'MEDIUM' ? '#F59E0B' : '#10B981';
            size = 24;
            shape = 'hexagon';
          } else if (n.type === 'upi') {
            color = '#9333EA';
            shape = 'diamond';
            size = 18;
          } else if (n.type === 'phone') {
            color = '#059669';
            shape = 'triangle';
            size = 18;
          } else if (n.type === 'domain') {
            color = '#D97706';
            shape = 'square';
            size = 18;
          }

          return {
            id: n.id,
            label: n.label,
            color: {
              background: color,
              border: '#FFFFFF',
              highlight: { background: '#00D4FF', border: '#FFFFFF' }
            },
            font: { color: '#0F172A', size: 11, face: 'Inter, system-ui, sans-serif', bold: true },
            shape,
            size,
            borderWidth: 2,
            shadow: true,
            raw: n
          };
        });

        const visEdges = filteredEdges.map((e) => ({
          from: e.from,
          to: e.to,
          color: { color: '#94A3B8', highlight: '#00D4FF' },
          width: 2,
          smooth: { type: 'continuous' }
        }));

        const options = {
          physics: {
            stabilization: { iterations: 150 },
            barnesHut: { gravitationalConstant: -3800, springLength: 100, springConstant: 0.04 }
          },
          interaction: { hover: true, tooltipDelay: 100 },
          nodes: {
            scaling: { min: 14, max: 32 }
          }
        };

        const network = new VisNetwork(
          containerRef.current,
          {
            nodes: new VisDataSet(visNodes),
            edges: new VisDataSet(visEdges)
          },
          options
        );

        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeObj = filteredNodes.find((n) => n.id === nodeId);
            if (nodeObj) {
              // Find connected nodes
              const connectedEdgeList = filteredEdges.filter((e) => e.from === nodeId || e.to === nodeId);
              const connectedNodeIds = new Set(
                connectedEdgeList.map((e) => (e.from === nodeId ? e.to : e.from))
              );
              const connectedItems = graphData.nodes.filter((n) => connectedNodeIds.has(n.id));

              setSelectedNode({
                ...nodeObj,
                connections: connectedItems
              });
            }
          } else {
            setSelectedNode(null);
          }
        });

        setNetworkInstance(network);

        return () => {
          network.destroy();
        };
      } catch (err) {
        console.error('Error initializing vis network:', err);
      }
    }
  }, [loading, graphData, filterType]);

  const handleReset = () => {
    if (networkInstance) {
      networkInstance.fit({ animation: { duration: 600 } });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <Network className="w-4 h-4" />
            <span>Cross-FIR Correlation & Syndicate Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Syndicate Entity Relationship Graph</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizes cross-case links connecting separate FIRs through shared phone numbers, mule UPI VPAs, and hosting infrastructure.
          </p>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-semibold">
            {['ALL', 'case', 'phone', 'upi', 'domain'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[11px] transition ${
                  filterType === type ? 'bg-cyan-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All' : type}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Main Canvas + Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col relative min-h-[580px]">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pb-3 border-b border-slate-100">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-rose-500 mr-1.5"></span>
              High-Risk FIR
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-sm bg-purple-600 mr-1.5"></span>
              Mule UPI VPA
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-emerald-600 mr-1.5 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]"></span>
              Phone Number
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-xs bg-amber-600 mr-1.5"></span>
              Phishing Domain
            </span>
            <span className="ml-auto text-[11px] text-slate-400 font-normal">
              {graphData.nodes ? `${graphData.nodes.length} Nodes • ${graphData.edges.length} Links Indexed` : ''}
            </span>
          </div>

          {/* Canvas Mount */}
          <div className="relative flex-1 w-full min-h-[500px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/70 z-10">
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 animate-pulse">
                  <Network className="w-5 h-5 animate-spin" />
                  <span>Loading Syndicate Graph...</span>
                </div>
              </div>
            )}
            <div ref={containerRef} className="w-full h-full min-h-[500px]" />
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tip: Drag nodes to rearrange • Scroll to zoom • Click any node for connected case intelligence.</span>
            <span className="text-emerald-600 font-bold">Auto-Stabilizing Barnes-Hut Physics</span>
          </div>
        </div>

        {/* Node Intelligence Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-cyan-500" />
              <span>Node Intelligence</span>
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedNode.type} Identifier
                  </div>
                  <div className="text-sm font-black text-slate-900 break-all mt-0.5">
                    {selectedNode.label}
                  </div>
                  {selectedNode.risk && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-700">
                      {selectedNode.risk} Threat Assessment
                    </div>
                  )}
                </div>

                {/* Connected Cases & Entities */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Associated Network ({selectedNode.connections?.length || 0})</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedNode.connections && selectedNode.connections.length > 0 ? (
                      selectedNode.connections.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-cyan-600">{c.type}</span>
                            {c.risk && (
                              <span
                                className={`text-[10px] font-bold ${
                                  c.risk === 'HIGH' ? 'text-rose-600' : 'text-amber-600'
                                }`}
                              >
                                {c.risk}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-800 break-all">{c.label}</div>
                          {c.type === 'case' && (
                            <Link
                              to={`/cases?id=${c.id}`}
                              className="inline-flex items-center text-[10px] text-cyan-600 font-bold hover:underline mt-1"
                            >
                              <span>Inspect Dossier</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">No connected nodes in active view.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-16 text-center text-slate-400 space-y-3">
                <Network className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs">
                  Click on any node in the graph to inspect connected FIRs, shared endpoints, and evidentiary records.
                </p>
              </div>
            )}
          </div>

          {selectedNode?.type === 'case' && (
            <Link
              to={`/cases?id=${selectedNode.id}`}
              className="mt-4 w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <span>Open Complete Case Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
