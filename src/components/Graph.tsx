import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Paper, Specialty, GraphNode, GraphLink, GraphLinkType, MasteryLevel, PaperContentType } from '../types';
import { SPECIALTIES } from '../constants';
import { RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface GraphProps {
  papers: Paper[];
  links: { source: string; target: string; type: GraphLinkType }[];
  onNodeClick: (paper: Paper) => void;
  isDark: boolean;
}

export const Graph: React.FC<GraphProps> = ({ papers, links, onNodeClick, isDark }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const resetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes: GraphNode[] = papers.map((paper) => ({
      id: paper.id,
      paper,
    }));

    const graphLinks: GraphLink[] = links.map((link) => ({
      source: link.source,
      target: link.target,
      type: link.type,
    }));

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphLinks).id((d) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((d) => (d.paper.clinicalWeight || 5) * 2 + 10))
      .force('x', d3.forceX(dimensions.width / 2).strength(0.05))
      .force('y', d3.forceY(dimensions.height / 2).strength(0.05));

    const g = svg.append('g');

    // Add gradients for links
    const defs = svg.append('defs');
    
    // Noise filter for texture
    const filter = defs.append('filter').attr('id', 'noiseFilter');
    filter.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.6')
      .attr('numOctaves', '3')
      .attr('stitchTiles', 'stitch');
    filter.append('feColorMatrix')
      .attr('type', 'saturate')
      .attr('values', '0');
    filter.append('feComponentTransfer')
      .append('feFuncA').attr('type', 'linear').attr('slope', '0.05');

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    glowFilter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    graphLinks.forEach((d, i) => {
      const sourceNode = nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source.id));
      const targetNode = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
      if (sourceNode && targetNode) {
        const sColor = SPECIALTIES.find(s => s.id === sourceNode.paper.specialtyId)?.color || '#3B82F6';
        const tColor = SPECIALTIES.find(s => s.id === targetNode.paper.specialtyId)?.color || '#3B82F6';
        
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${sourceNode.id}-${targetNode.id}`)
          .attr('gradientUnits', 'userSpaceOnUse');
        
        gradient.append('stop').attr('offset', '0%').attr('stop-color', sColor).attr('stop-opacity', 0.6);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', tColor).attr('stop-opacity', 0.6);
      }
    });

    // Specialty Nebulae (Organic)
    const nebulae = g.append('g').attr('class', 'nebulae');
    SPECIALTIES.forEach((s) => {
      const specialtyNodes = nodes.filter(n => (n as GraphNode).paper.specialtyId === s.id);
      if (specialtyNodes.length > 0) {
        const nebulaGroup = nebulae.append('g').attr('class', `nebula-group-${s.id}`);
        
        // Multiple overlapping circles for organic feel
        for (let i = 0; i < 3; i++) {
          const nebula = nebulaGroup.append('circle')
            .attr('class', `nebula-part-${i}`)
            .attr('r', 120 + i * 40)
            .attr('fill', s.color)
            .attr('fill-opacity', 0.02 - i * 0.005)
            .attr('filter', `blur(${40 + i * 20}px)`);

          // Add pulsing animation
          nebula.append('animate')
            .attr('attributeName', 'r')
            .attr('values', `${120 + i * 40};${130 + i * 40};${120 + i * 40}`)
            .attr('dur', `${4 + i * 2}s`)
            .attr('repeatCount', 'indefinite');
        }
      }
    });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(graphLinks)
      .join('line')
      .attr('stroke', (d) => {
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source.id));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        if (sourceNode && targetNode) {
          return `url(#gradient-${sourceNode.id}-${targetNode.id})`;
        }
        return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      })
      .attr('stroke-width', (d) => d.type === 'prerequisite' ? 2 : 1)
      .attr('stroke-dasharray', (d) => {
        if (d.type === 'suggested') return '4,4';
        if (d.type === 'bridge') return '2,2';
        return 'none';
      })
      .attr('stroke-opacity', 0.4)
      .style('filter', 'url(#glow)');

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNodeId(d.id);
        
        const scale = 2;
        const x = dimensions.width / 2 - d.x! * scale;
        const y = dimensions.height / 2 - d.y! * scale;

        svg.transition()
          .duration(750)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));

        onNodeClick(d.paper);
      })
      .on('mouseenter', function() {
        d3.select(this).select('.main-shape')
          .transition()
          .duration(200)
          .attr('transform', (d: any) => {
            const size = (d.paper.clinicalWeight || 5) * 1.5 + 5;
            return d.paper.contentType === 'guideline' ? 'rotate(45) scale(1.2)' : 'scale(1.2)';
          });
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .attr('fill-opacity', 1);
      })
      .on('mouseleave', function() {
        d3.select(this).select('.main-shape')
          .transition()
          .duration(200)
          .attr('transform', (d: any) => {
            return d.paper.contentType === 'guideline' ? 'rotate(45) scale(1)' : 'scale(1)';
          });
        if (zoomLevel <= 1.5) {
          d3.select(this).select('text')
            .transition()
            .duration(200)
            .attr('fill-opacity', 0);
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Node Shapes based on content type
    node.each(function(d) {
      const el = d3.select(this);
      const size = (d.paper.clinicalWeight || 5) * 1.5 + 5;
      const specialty = SPECIALTIES.find(s => s.id === d.paper.specialtyId);
      const color = specialty?.color || '#3B82F6';

      // Mastery Rings
      if (d.paper.masteryLevel === 'completed' || d.paper.masteryLevel === 'mastered') {
        el.append('circle')
          .attr('r', size + 4)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.5);
      }
      
      if (d.paper.masteryLevel === 'mastered') {
        el.append('circle')
          .attr('r', size + 7)
          .attr('fill', 'none')
          .attr('stroke', '#F59E0B')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.8);
      }

      // Main Shape
      const shape = (() => {
        switch(d.paper.contentType) {
          case 'guideline':
            return el.append('rect')
              .attr('width', size * 1.4)
              .attr('height', size * 1.4)
              .attr('x', -size * 0.7)
              .attr('y', -size * 0.7)
              .attr('transform', 'rotate(45)');
          case 'review':
            return el.append('path')
              .attr('d', d3.symbol(d3.symbolDiamond, size * 10)());
          case 'audiobook':
            return el.append('path')
              .attr('d', d3.symbol(d3.symbolStar, size * 10)());
          default:
            return el.append('circle')
              .attr('r', size);
        }
      })();

      shape
        .attr('class', 'main-shape')
        .attr('fill', d.paper.masteryLevel === 'unread' ? '#475569' : color)
        .attr('fill-opacity', d.paper.masteryLevel === 'unread' ? 0.7 : 1)
        .style('filter', d.paper.masteryLevel === 'mastered' ? 'url(#glow)' : 'none');

      // Pulsing halo for in-progress
      if (d.paper.masteryLevel === 'in-progress') {
        el.append('circle')
          .attr('r', size)
          .attr('fill', 'none')
          .attr('stroke', '#F97316')
          .attr('stroke-width', 2)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('from', size)
          .attr('to', size + 10)
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite');
        
        el.select('circle:last-child')
          .append('animate')
          .attr('attributeName', 'stroke-opacity')
          .attr('from', 1)
          .attr('to', 0)
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite');
      }
    });

    // Labels
    const labels = node.append('text')
      .text((d) => d.paper.title)
      .attr('x', (d) => (d.paper.clinicalWeight || 5) * 1.5 + 15)
      .attr('y', 4)
      .attr('fill', isDark ? '#fff' : '#000')
      .attr('fill-opacity', 0) // Hidden by default
      .attr('font-size', '11px')
      .attr('font-serif', 'true')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .attr('class', 'transition-opacity duration-300')
      .style('text-shadow', isDark ? '0 0 8px rgba(0,0,0,0.8)' : '0 0 8px rgba(255,255,255,0.8)');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      // Update gradient coordinates
      graphLinks.forEach((d: any) => {
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : d.source.id));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        if (sourceNode && targetNode) {
          defs.select(`#gradient-${sourceNode.id}-${targetNode.id}`)
            .attr('x1', d.source.x)
            .attr('y1', d.source.y)
            .attr('x2', d.target.x)
            .attr('y2', d.target.y);
        }
      });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Update nebulae positions
      SPECIALTIES.forEach(s => {
        const specialtyNodes = nodes.filter(n => (n as GraphNode).paper.specialtyId === s.id);
        if (specialtyNodes.length > 0) {
          const avgX = d3.mean(specialtyNodes, n => n.x);
          const avgY = d3.mean(specialtyNodes, n => n.y);
          nebulae.select(`.nebula-${s.id}`)
            .attr('cx', avgX || 0)
            .attr('cy', avgY || 0);
        }
      });

      // LOD: Show labels based on zoom
      labels.attr('fill-opacity', zoomLevel > 1.5 ? 0.8 : 0);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [dimensions, papers, links, onNodeClick, isDark, zoomLevel]);

  return (
    <div ref={containerRef} className="w-full h-full graph-container overflow-hidden bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.05),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.05),transparent_40%)] pointer-events-none" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ filter: 'url(#noiseFilter)' }} />
      
      {/* Controls */}
      <div className="absolute top-24 right-8 z-30 flex flex-col gap-3">
        <button 
          onClick={resetZoom}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-foreground/70 hover:text-blue-500 hover:bg-foreground/10 transition-all hover:scale-110 active:scale-90 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-foreground/10"
          title="Reset View"
        >
          <Maximize2 size={20} />
        </button>
        <div className="w-12 h-px bg-foreground/5 mx-auto" />
        <button 
          onClick={() => {
            if (svgRef.current && zoomRef.current) {
              d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.5);
            }
          }}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-foreground/70 hover:text-blue-500 hover:bg-foreground/10 transition-all hover:scale-110 active:scale-90 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-foreground/10"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={() => {
            if (svgRef.current && zoomRef.current) {
              d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.7);
            }
          }}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-foreground/70 hover:text-blue-500 hover:bg-foreground/10 transition-all hover:scale-110 active:scale-90 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-foreground/10"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full relative z-10"
      />
    </div>
  );
};
