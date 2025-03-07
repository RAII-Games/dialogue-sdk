import React, { RefObject } from 'react';
import { DialogueNode, Connection } from '../types/dialogue';
import NodeComponent from './NodeComponent';

interface EditorCanvasProps {
    svgRef: RefObject<SVGSVGElement | null>;
    nodes: DialogueNode[];
    connections: Connection[];
    viewportTransform: { x: number; y: number; scale: number };
    isConnecting: boolean;
    connectingFromNode: DialogueNode | null;
    mousePosition: { x: number; y: number };
    selectedNode: DialogueNode | null;
    onStartPan: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onZoom: (e: React.WheelEvent) => void;
    onCanvasClick: () => void;
    onDeleteConnection: (connectionId: string) => void;
    onSelectNode: (e: React.MouseEvent, node: DialogueNode) => void;
    onStartDrag: (e: React.MouseEvent, node: DialogueNode) => void;
    onStartConnect: (node: DialogueNode) => void;
    onFinishConnect: (node: DialogueNode) => void;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
    svgRef,
    nodes,
    connections,
    viewportTransform,
    isConnecting,
    connectingFromNode,
    mousePosition,
    selectedNode,
    onStartPan,
    onMouseMove,
    onZoom,
    onCanvasClick,
    onDeleteConnection,
    onSelectNode,
    onStartDrag,
    onStartConnect,
    onFinishConnect
}) => {
    return (
        <div className="canvas-container">
            <svg
                ref={svgRef}
                width="100%"
                height="600"
                className="svg-canvas"
                onMouseDown={onStartPan}
                onMouseMove={onMouseMove}
                onWheel={onZoom}
                onClick={onCanvasClick}
            >
                {/* grid bg */}
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ccc" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* viewport transform */}
                <g transform={`translate(${viewportTransform.x}, ${viewportTransform.y}) scale(${viewportTransform.scale})`}>
                    {connections.map(connection => {
                        const sourceNode = nodes.find(n => n.id === connection.source);
                        const targetNode = nodes.find(n => n.id === connection.target);

                        if (!sourceNode || !targetNode) return null;

                        return (
                            <g key={connection.id}>
                                {/* Connection line */}
                                <line
                                    x1={sourceNode.x + 150}
                                    y1={sourceNode.y + 50}
                                    x2={targetNode.x}
                                    y2={targetNode.y + 50}
                                    stroke="#6b7280"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConnection(connection.id);
                                    }}
                                />

                                <foreignObject
                                    x={(sourceNode.x + 150 + targetNode.x) / 2 - 50}
                                    y={(sourceNode.y + 50 + targetNode.y + 50) / 2 - 12}
                                    width="100"
                                    height="24"
                                >
                                    <div className="connection-label">
                                        {connection.optionText}
                                    </div>
                                </foreignObject>

                                <circle
                                    cx={(sourceNode.x + 150 + targetNode.x) / 2}
                                    cy={(sourceNode.y + 50 + targetNode.y + 50) / 2}
                                    r="12"
                                    fill="red"
                                    opacity="0"
                                    className="hover:opacity-30 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConnection(connection.id);
                                    }}
                                />
                            </g>
                        );
                    })}

                    {isConnecting && connectingFromNode && (
                        <line
                            x1={connectingFromNode.x + 150}
                            y1={connectingFromNode.y + 50}
                            x2={mousePosition.x}
                            y2={mousePosition.y}
                            stroke="#6b7280"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}

                    {/* Nodes */}
                    {nodes.map(node => (
                        <NodeComponent
                            key={node.id}
                            node={node}
                            isSelected={selectedNode?.id === node.id}
                            isConnecting={isConnecting}
                            isConnectingSource={connectingFromNode?.id === node.id}
                            onSelect={(e) => onSelectNode(e, node)}
                            onStartDrag={onStartDrag}
                            onStartConnect={onStartConnect}
                            onFinishConnect={onFinishConnect}
                            connectionCount={connections.filter(conn => conn.source === node.id).length}
                        />
                    ))}

                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="7"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                    </defs>
                </g>

                <g className="viewport-controls" transform="translate(20, 20)">
                    <circle r="15" fill="#fff" stroke="#ccc" />
                    <text y="5" textAnchor="middle" fontSize="12" fill="#666">
                        {Math.round(viewportTransform.scale * 100)}%
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default EditorCanvas;