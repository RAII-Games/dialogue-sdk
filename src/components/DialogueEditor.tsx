import React, { useState, useRef, useEffect } from "react";
import { DialogueNode, Connection } from "../types/dialogue";
import { generateLuaCode } from "../utils/codeGenerator";
import { useKeyboardNavigation } from "../utils/keyboardNav";
import EditorToolbar from "./EditorToolbar";
import EditorInstructions from "./EditorInstructions";
import EditorCanvas from "./EditorCanvas";
import PropertiesPanel from "./PropertiesPanel";
import ExportModal from "./ExportModal";
import "../index.css";

const DialogueEditor: React.FC = () => {
    const [nodes, setNodes] = useState<DialogueNode[]>([
        { id: 1, speaker: "NPC", text: "Hello there!", x: 100, y: 100 },
        { id: 2, speaker: "NPC", text: "How can I help you today?", x: 350, y: 100 }
    ]);

    const [connections, setConnections] = useState<Connection[]>([
        { id: "1-2", source: 1, target: 2, optionText: "Continue" }
    ]);

    const [viewportTransform, setViewportTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const [selectedNode, setSelectedNode] = useState<DialogueNode | null>(null);
    const [draggingNode, setDraggingNode] = useState<DialogueNode | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingFromNode, setConnectingFromNode] = useState<DialogueNode | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportedCode, setExportedCode] = useState("");

    const [nextNodeId, setNextNodeId] = useState(3);

    const svgRef = useRef<SVGSVGElement>(null);

    const updateNodePosition = (nodeId: number, newX: number, newY: number) => {
        setNodes(prevNodes => {
            const updatedNodes = prevNodes.map(node => 
                node.id === nodeId ? { ...node, x: newX, y: newY } : node
            );
            
            if (selectedNode && selectedNode.id === nodeId) {
                const updatedNode = updatedNodes.find(n => n.id === nodeId);
                if (updatedNode) {
                    setSelectedNode(updatedNode);
                }
            }
            
            return updatedNodes;
        });
    };


    const addNode = () => {
        if (!svgRef.current) return;

        const boundingRect = svgRef.current.getBoundingClientRect();
        const centerX = (boundingRect.width / 2 - viewportTransform.x) / viewportTransform.scale;
        const centerY = (boundingRect.height / 2 - viewportTransform.y) / viewportTransform.scale;

        const newNode: DialogueNode = {
            id: nextNodeId,
            speaker: "NPC",
            text: "New dialogue entry",
            x: centerX - 75,
            y: centerY - 50,
            speed: 0.016,
            delay: 3
        };

        setNodes([...nodes, newNode]);
        setNextNodeId(nextNodeId + 1);
        setSelectedNode(newNode);
    };

    const updateNode = (updatedNode: DialogueNode) => {
        setNodes(nodes.map(node =>
            node.id === updatedNode.id ? updatedNode : node
        ));

        if (selectedNode && selectedNode.id === updatedNode.id) {
            setSelectedNode(updatedNode);
        }
    };

    const deleteNode = (nodeId: number) => {
        setNodes(nodes.filter(node => node.id !== nodeId));
        setConnections(connections.filter(
            conn => conn.source !== nodeId && conn.target !== nodeId
        ));

        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(null);
        }
    };

    useKeyboardNavigation({
        viewportTransform,
        setViewportTransform,
        selectedNode,
        deleteNode,
        updateNodePosition,
        nodes
    });

    const startConnecting = (node: DialogueNode) => {
        setIsConnecting(true);
        setConnectingFromNode(node);
    };

    const finishConnecting = (targetNode: DialogueNode) => {
        if (isConnecting && connectingFromNode && connectingFromNode.id !== targetNode.id) {
            const connectionExists = connections.some(
                conn => conn.source === connectingFromNode.id && conn.target === targetNode.id
            );

            if (!connectionExists) {
                const newConnection: Connection = {
                    id: `${connectingFromNode.id}-${targetNode.id}`,
                    source: connectingFromNode.id,
                    target: targetNode.id,
                    optionText: `Go to ${targetNode.speaker || 'node'}`
                };

                setConnections([...connections, newConnection]);
            }
        }

        setIsConnecting(false);
        setConnectingFromNode(null);
    };

    const updateConnection = (connectionId: string, optionText: string) => {
        setConnections(connections.map(conn =>
            conn.id === connectionId ? { ...conn, optionText } : conn
        ));
    };

    const deleteConnection = (connectionId: string) => {
        setConnections(connections.filter(conn => conn.id !== connectionId));
    };

    const startPan = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget || draggingNode || isConnecting) {
            return;
        }

        if (e.button === 1 || e.button === 0) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const pan = (e: MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;

            setViewportTransform({
                ...viewportTransform,
                x: viewportTransform.x + dx,
                y: viewportTransform.y + dy
            });

            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const endPan = () => {
        setIsPanning(false);
    };

    const zoom = (e: React.WheelEvent) => {
        e.preventDefault();

        if (!svgRef.current) return;

        const zoomIntensity = 0.1;
        const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
        const newScale = Math.min(Math.max(viewportTransform.scale + delta, 0.5), 2);

        const boundingRect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - boundingRect.left;
        const mouseY = e.clientY - boundingRect.top;

        const newX = viewportTransform.x - (mouseX - viewportTransform.x) * (delta / viewportTransform.scale);
        const newY = viewportTransform.y - (mouseY - viewportTransform.y) * (delta / viewportTransform.scale);

        setViewportTransform({
            x: newX,
            y: newY,
            scale: newScale
        });
    };

    const startDrag = (e: React.MouseEvent, node: DialogueNode) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!svgRef.current) return;

        const boundingRect = svgRef.current.getBoundingClientRect();
        const offsetX = e.clientX - boundingRect.left - (node.x * viewportTransform.scale + viewportTransform.x);
        const offsetY = e.clientY - boundingRect.top - (node.y * viewportTransform.scale + viewportTransform.y);
        
        setDraggingNode(node);
        setDragOffset({ x: offsetX, y: offsetY });
        setSelectedNode(node);
    };

    const drag = (e: MouseEvent) => {
        if (!draggingNode || !svgRef.current) return;
        
        const boundingRect = svgRef.current.getBoundingClientRect();
        const newX = (e.clientX - boundingRect.left - viewportTransform.x - dragOffset.x) / viewportTransform.scale;
        const newY = (e.clientY - boundingRect.top - viewportTransform.y - dragOffset.y) / viewportTransform.scale;

        const updatedNode = { ...draggingNode, x: newX, y: newY };
        setNodes(nodes.map(node => 
            node.id === draggingNode.id ? updatedNode : node
        ));
        
        setDraggingNode(updatedNode);
    };

    const endDrag = () => {
        setDraggingNode(null);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!svgRef.current) return;

        const boundingRect = svgRef.current.getBoundingClientRect();
        setMousePosition({
            x: (e.clientX - boundingRect.left - viewportTransform.x) / viewportTransform.scale,
            y: (e.clientY - boundingRect.top - viewportTransform.y) / viewportTransform.scale
        });
    };

    const focusOnNode = (nodeId: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect();
            setViewportTransform({
                x: (svgRect.width / 2) - (node.x * viewportTransform.scale),
                y: (svgRect.height / 2) - (node.y * viewportTransform.scale),
                scale: viewportTransform.scale
            });
            setSelectedNode(node);
        }
    };

    const resetView = () => {
        setViewportTransform({ x: 0, y: 0, scale: 1 });
    };

    const exportDialogue = () => {
        const nodeIndexMap: Record<number, number> = {};
        nodes.forEach((node, index) => {
            nodeIndexMap[node.id] = index + 1;
        });

        const dialogueEntries = nodes.map(node => {
            const nodeConnections = connections.filter(conn => conn.source === node.id);

            const options = nodeConnections.map(conn => ({
                text: conn.optionText || 'Continue',
                next_index: nodeIndexMap[conn.target]
            }));

            return {
                speaker: node.speaker,
                text: node.text,
                speed: node.speed || 0.016,
                options: options.length > 0 ? options : undefined,
                auto_continue: node.auto_continue,
                delay: node.delay || 3,
                end_dialogue: node.end_dialogue
            };
        });

        const code = generateLuaCode(dialogueEntries);

        setExportedCode(code);
        setShowExportModal(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingNode) {
                drag(e);
            }
            else if (isPanning) {
                pan(e);
            }

            if (isConnecting && svgRef.current) {
                const boundingRect = svgRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - boundingRect.left - viewportTransform.x) / viewportTransform.scale,
                    y: (e.clientY - boundingRect.top - viewportTransform.y) / viewportTransform.scale
                });
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            endDrag();
            endPan();

            if (isConnecting && connectingFromNode) {
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (element) {
                    const nodeId = element.getAttribute('data-node-id');
                    if (nodeId) {
                        const targetNode = nodes.find(n => n.id === parseInt(nodeId));
                        if (targetNode && targetNode.id !== connectingFromNode.id) {
                            finishConnecting(targetNode);
                            return;
                        }
                    }
                }

                setIsConnecting(false);
                setConnectingFromNode(null);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingNode, dragOffset, isPanning, panStart, viewportTransform, isConnecting, connectingFromNode, nodes]);

    return (
        <div className="container">
            <div className="editor-card">
                <EditorToolbar
                    zoomLevel={viewportTransform.scale}
                    onZoomIn={() => setViewportTransform({
                        ...viewportTransform,
                        scale: Math.min(viewportTransform.scale + 0.1, 2)
                    })}
                    onZoomOut={() => setViewportTransform({
                        ...viewportTransform,
                        scale: Math.max(viewportTransform.scale - 0.1, 0.5)
                    })}
                    onAddNode={addNode}
                    onResetView={resetView}
                    onExport={exportDialogue}
                />

                <EditorInstructions />

                <div className="flex-container">
                    <EditorCanvas
                        svgRef={svgRef}
                        nodes={nodes}
                        connections={connections}
                        viewportTransform={viewportTransform}
                        isConnecting={isConnecting}
                        connectingFromNode={connectingFromNode}
                        mousePosition={mousePosition}
                        selectedNode={selectedNode}
                        onStartPan={startPan}
                        onMouseMove={handleCanvasMouseMove}
                        onZoom={zoom}
                        onCanvasClick={() => setSelectedNode(null)}
                        onDeleteConnection={deleteConnection}
                        onSelectNode={(e, node) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                        }}
                        onStartDrag={startDrag}
                        onStartConnect={startConnecting}
                        onFinishConnect={finishConnecting}
                    />

                    <PropertiesPanel
                        selectedNode={selectedNode}
                        nodes={nodes}
                        connections={connections.filter(conn => selectedNode && conn.source === selectedNode.id)}
                        onUpdateNode={updateNode}
                        onDeleteNode={deleteNode}
                        onUpdateConnection={updateConnection}
                        onFocusNode={focusOnNode}
                    />
                </div>
            </div>

            {showExportModal && (
                <ExportModal
                    code={exportedCode}
                    onClose={() => setShowExportModal(false)}
                />
            )}
        </div>
    );
};

export default DialogueEditor;