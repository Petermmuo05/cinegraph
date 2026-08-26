"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3-force";
import { GraphData, GraphNode, GraphEdge } from "@/types";
import NodeDetailsDrawer from "./NodeDetailsDrawer";
import GraphControls from "./GraphControls";
import GraphLegend from "./GraphLegend";
import { Loader2 } from "lucide-react";

interface ForceGraphViewProps {
  initialData?: GraphData;
  selectedNodeId?: string | null;
  onNodeSelect?: (node: GraphNode | null) => void;
  height?: string;
}

export default function ForceGraphView({
  initialData,
  selectedNodeId,
  onNodeSelect,
  height = "h-[750px]",
}: ForceGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<any>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Camera transform: { x, y, k }
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  const fetchInitialGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/initial");
      const data: GraphData = await res.json();
      setNodes(data.nodes.map((n) => ({ ...n })));
      setEdges(data.edges.map((e) => ({ ...e })));
    } catch (e) {
      console.error("Failed to load initial graph", e);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes.map((n) => ({ ...n })));
      setEdges(initialData.edges.map((e) => ({ ...e })));
    } else {
      fetchInitialGraph();
    }
  }, [initialData]);

  // Auto-focus selected node when selectedNodeId or nodes change
  useEffect(() => {
    if (!selectedNodeId || nodes.length === 0) return;
    const targetNode = nodes.find((n) => n.id === selectedNodeId);
    if (targetNode) {
      setActiveNode(targetNode);
      if (onNodeSelect) onNodeSelect(targetNode);
      if (canvasRef.current && targetNode.x !== undefined && targetNode.y !== undefined) {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        transformRef.current = {
          x: width / 2 - targetNode.x * 1.25,
          y: height / 2 - targetNode.y * 1.25,
          k: 1.25,
        };
        drawCanvas();
      }
    }
  }, [selectedNodeId, nodes]);

  // Expand neighborhood on double click
  const handleExpandNode = async (node: GraphNode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/expand?nodeId=${encodeURIComponent(node.id)}`);
      const expanded: GraphData = await res.json();

      setNodes((prev) => {
        const existingMap = new Map(prev.map((n) => [n.id, n]));
        expanded.nodes.forEach((n) => {
          if (!existingMap.has(n.id)) {
            // Position new nodes near the parent
            existingMap.set(n.id, {
              ...n,
              x: (node.x || 0) + (Math.random() - 0.5) * 80,
              y: (node.y || 0) + (Math.random() - 0.5) * 80,
            });
          }
        });
        return Array.from(existingMap.values());
      });

      setEdges((prev) => {
        const edgeKeys = new Set(
          prev.map((e) => `${typeof e.source === "object" ? (e.source as any).id : e.source}-${typeof e.target === "object" ? (e.target as any).id : e.target}`)
        );
        const newEdges = [...prev];
        expanded.edges.forEach((e) => {
          const s = typeof e.source === "object" ? (e.source as any).id : e.source;
          const t = typeof e.target === "object" ? (e.target as any).id : e.target;
          if (!edgeKeys.has(`${s}-${t}`)) {
            newEdges.push(e);
            edgeKeys.add(`${s}-${t}`);
          }
        });
        return newEdges;
      });
    } catch (err) {
      console.error("Failed to expand node", err);
    } finally {
      setLoading(false);
    }
  };

  // D3 Simulation setup
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Filter nodes if needed
    const visibleNodes = filterType === "ALL" ? nodes : nodes.filter((n) => n.label === filterType);
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = edges.filter((e) => {
      const sId = typeof e.source === "object" ? (e.source as any).id : e.source;
      const tId = typeof e.target === "object" ? (e.target as any).id : e.target;
      return visibleNodeIds.has(sId) && visibleNodeIds.has(tId);
    });

    const sim = d3
      .forceSimulation(visibleNodes as any)
      .force(
        "link",
        d3
          .forceLink(visibleEdges as any)
          .id((d: any) => d.id)
          .distance(110)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => (d.size || 20) + 12))
      .alphaDecay(0.025);

    simulationRef.current = sim;

    sim.on("tick", () => {
      drawCanvas();
    });

    return () => {
      sim.stop();
    };
  }, [nodes, edges, filterType]);

  // Main Canvas Rendering Loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { x: tx, y: ty, k: tk } = transformRef.current;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(tk, tk);

    // Draw Edges
    const visibleEdges = edges;
    for (const edge of visibleEdges) {
      const source: any = edge.source;
      const target: any = edge.target;
      if (!source?.x || !target?.x) continue;

      const isConnectedToActive =
        activeNode &&
        (source.id === activeNode.id || target.id === activeNode.id);
      const isConnectedToHover =
        hoveredNode &&
        (source.id === hoveredNode.id || target.id === hoveredNode.id);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      if (isConnectedToActive || isConnectedToHover) {
        ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "rgba(52, 211, 153, 0.8)";
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Draw Nodes
    const visibleNodes = filterType === "ALL" ? nodes : nodes.filter((n) => n.label === filterType);
    for (const node of visibleNodes) {
      if (node.x === undefined || node.y === undefined) continue;

      const isSelected = activeNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const radius = (node.size || 20) * (isSelected ? 1.3 : isHovered ? 1.15 : 1);

      // Node base color
      let baseColor = node.color || "#10B981";
      if (node.label === "Movie") baseColor = "#3B82F6";
      else if (node.label === "Person") baseColor = node.properties?.primaryRole === "Director" ? "#34D399" : "#10B981";
      else if (node.label === "Genre") baseColor = "#06B6D4";
      else if (node.label === "Trope") baseColor = "#EC4899";
      else if (node.label === "Studio") baseColor = "#F59E0B";

      // Outer glow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? "rgba(52, 211, 153, 0.35)" : "rgba(255, 255, 255, 0.15)";
        ctx.fill();
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(
        node.x - radius * 0.3,
        node.y - radius * 0.3,
        radius * 0.1,
        node.x,
        node.y,
        radius
      );
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(0.3, baseColor);
      gradient.addColorStop(1, "#040D0A");
      ctx.fillStyle = gradient;
      ctx.fill();

      // Border ring
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeStyle = isSelected ? "#34D399" : "rgba(255, 255, 255, 0.4)";
      ctx.stroke();

      // Label Text
      const labelText = node.name || node.title || node.id;
      ctx.font = `${isSelected ? "bold 13px" : "500 11px"} "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = isSelected ? "#34D399" : "rgba(243, 250, 247, 0.9)";
      ctx.fillText(labelText, node.x, node.y + radius + 14);
    }

    ctx.restore();
  }, [nodes, edges, activeNode, hoveredNode, filterType]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      drawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  // Coordinate conversion screen to graph
  const getGraphCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const { x: tx, y: ty, k: tk } = transformRef.current;
    return {
      x: (sx - tx) / tk,
      y: (sy - ty) / tk,
    };
  };

  const findNodeAtCoords = (gx: number, gy: number): GraphNode | null => {
    const visibleNodes = filterType === "ALL" ? nodes : nodes.filter((n) => n.label === filterType);
    for (let i = visibleNodes.length - 1; i >= 0; i--) {
      const node = visibleNodes[i];
      if (node.x === undefined || node.y === undefined) continue;
      const dist = Math.hypot(node.x - gx, node.y - gy);
      if (dist <= (node.size || 20) + 6) {
        return node;
      }
    }
    return null;
  };

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findNodeAtCoords(x, y);

    if (hitNode) {
      draggedNodeRef.current = hitNode;
      hitNode.fx = hitNode.x;
      hitNode.fy = hitNode.y;
      if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = x;
      draggedNodeRef.current.fy = y;
      drawCanvas();
      return;
    }

    if (isDraggingCanvasRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      drawCanvas();
      return;
    }

    const hit = findNodeAtCoords(x, y);
    if (hit !== hoveredNode) {
      setHoveredNode(hit);
      drawCanvas();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      if (simulationRef.current) simulationRef.current.alphaTarget(0);
    }
    isDraggingCanvasRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findNodeAtCoords(x, y);
    setActiveNode(hitNode);
    if (onNodeSelect) onNodeSelect(hitNode);
    drawCanvas();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findNodeAtCoords(x, y);
    if (hitNode) {
      handleExpandNode(hitNode);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newK = Math.max(0.2, Math.min(4, transformRef.current.k * zoomFactor));

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    transformRef.current.x = mouseX - (mouseX - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = mouseY - (mouseY - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;

    drawCanvas();
  };

  // Zoom Controls
  const handleZoom = (factor: number) => {
    if (!canvasRef.current) return;
    const cx = canvasRef.current.width / 2;
    const cy = canvasRef.current.height / 2;
    const newK = Math.max(0.2, Math.min(4, transformRef.current.k * factor));

    transformRef.current.x = cx - (cx - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = cy - (cy - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;
    drawCanvas();
  };

  const handleResetCamera = () => {
    transformRef.current = { x: 0, y: 0, k: 1 };
    drawCanvas();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} rounded-[32px] overflow-hidden glass-panel border border-white/15`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Controls Toolbar */}
      <GraphControls
        filterType={filterType}
        onFilterChange={setFilterType}
        onZoomIn={() => handleZoom(1.2)}
        onZoomOut={() => handleZoom(0.8)}
        onReset={handleResetCamera}
        onRefresh={fetchInitialGraph}
      />

      {/* Legend */}
      <GraphLegend />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-card flex items-center gap-2 text-xs text-emerald-400 z-20 shadow-lg animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Expanding graph neighborhood...</span>
        </div>
      )}

      {/* Responsive Node Details Drawer */}
      <NodeDetailsDrawer
        node={activeNode}
        onClose={() => {
          setActiveNode(null);
          if (onNodeSelect) onNodeSelect(null);
        }}
        onExpand={handleExpandNode}
      />
    </div>
  );
}
