import React, { useState, useEffect, useRef } from 'react';
import { Network, Search, Filter, RotateCcw, AlertTriangle, Layers, Info } from 'lucide-react';

export default function ScamGraph() {
  const containerRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [networkInstance, setNetworkInstance] = useState(null);

  useEffect(() => {
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
    if (!loading && containerRef.current && window.vis && graphData.nodes.length > 0) {
      const visNodes = graphData.nodes.map((n) => {
        let color = '#0284C7';
        let shape = 'dot';
        let size = 18;

        if (n.type === 'case') {
          color = n.risk === 'HIGH' ? '#EF4444' : n.risk === 'MEDIUM' ? '#F59E0B' : '#10B981';
          size = 22;
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
          color: { background: color, border: '#FFFFFF', highlight: { background: '#00D4FF', border: '#FFFFFF' } },
          font: { color: '#0F172A', size: 10, face: 'Helvetica' },
          shape,
          size,
          raw: n
        };
      });

      const visEdges = graphData.edges.map((e) => ({
        from: e.from,
        to: e.to,
        color: { color: '#94A3B8', highlight: '#00D4FF' },
        width: 1.5
      }));

      const options = {
        physics: {
          stabilization: true,
          barnesHut: { gravitationalConstant: -3500, springLength: 90 }
        },
        interaction: { hover: true }
      };

      const network = new window.vis.Network(
        containerRef.current,
        { nodes: new window.vis.DataSet(visNodes), edges: new window.vis.DataSet(visEdges) },
        options
      );

      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const clickedId = params.nodes[0];
          const found = graphData.nodes.find((n) => n.id === clickedId);
          setSelectedNode(found || null);
        } else {
          setSelectedNode(null);
        }
      });

      setNetworkInstance(network);
    }
  }, [loading, graphData]);

  const fitGraph = () => {
    if (networkInstance) {
      networkInstance.fit({ animation: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
            <Network className="w-4 h-4" />
            <span>Module 5 • Cross-Case Correlation Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Syndicate Entity Relationship Graph
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizes hidden links connecting distinct FIRs through shared phone numbers, UPI VPAs, and hosting domains.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fitGraph}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-slate-700">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span> High-Risk FIR
              </span>
              <span className="flex items-center text-slate-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 mr-1.5"></span> UPI VPA
              </span>
              <span className="flex items-center text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-600 mr-1.5"></span> Phone Number
              </span>
              <span className="flex items-center text-slate-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></span> Phishing Domain
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              {graphData.nodes.length} Nodes • {graphData.edges.length} Links Indexed
            </span>
          </div>

          <div
            ref={containerRef}
            className="w-full h-[520px] bg-slate-50/70 rounded-xl border border-slate-100"
          ></div>
        </div>

        {/* Node Inspection Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Info className="w-4 h-4 text-cyan-600" />
            <span>Node Intelligence</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Selected Entity</span>
                <div className="font-mono font-bold text-sm text-slate-900 mt-1 break-all">
                  {selectedNode.label}
                </div>
                <div className="text-[11px] text-cyan-700 font-semibold mt-1 uppercase">
                  Type: {selectedNode.type}
                </div>
              </div>

              {selectedNode.type === 'case' ? (
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Risk Assessment:</span>
                    <span className="font-bold text-red-600">
                      {selectedNode.risk} ({selectedNode.score}/100)
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Threat Vector:</span>
                    <span className="font-bold text-slate-800">{selectedNode.source}</span>
                  </div>
                  <a
                    href={`/cases?id=${selectedNode.id}`}
                    className="block text-center py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition"
                  >
                    Open Case Dossier
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-700 font-bold block">Syndicate Linkage</span>
                    <span className="text-red-600 text-[11px] mt-0.5 block">
                      Appears across {selectedNode.case_count || selectedNode.cases?.length || 1} distinct FIRs.
                    </span>
                  </div>

                  {selectedNode.cases && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-600">Connected Cases:</span>
                      <div className="mt-1 space-y-1">
                        {selectedNode.cases.map((cid, i) => (
                          <a
                            key={i}
                            href={`/cases?id=${cid}`}
                            className="block p-1.5 bg-slate-50 hover:bg-slate-100 rounded font-mono text-[11px] text-cyan-700 font-semibold"
                          >
                            {cid}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-xs text-center py-12 space-y-2">
              <Network className="w-8 h-8 mx-auto text-slate-300" />
              <p>Click on any node in the graph to inspect connected FIRs, shared endpoints, and evidentiary records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
