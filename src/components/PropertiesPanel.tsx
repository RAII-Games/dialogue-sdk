import React from "react";
import { DialogueNode, Connection } from "../types/dialogue";

interface PropertiesPanelProps {
    selectedNode: DialogueNode | null;
    nodes: DialogueNode[];
    connections: Connection[];
    onUpdateNode: (node: DialogueNode) => void;
    onDeleteNode: (nodeId: number) => void;
    onUpdateConnection: (connectionId: string, optionText: string) => void;
    onFocusNode: (nodeId: number) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    selectedNode,
    nodes,
    connections,
    onUpdateNode,
    onDeleteNode,
    onUpdateConnection,
    onFocusNode
}) => {
    const handleInputChange = (field: keyof DialogueNode, value: any) => {
        if (!selectedNode) return;

        // Create updated node with new value
        const updatedNode = { ...selectedNode, [field]: value };
        onUpdateNode(updatedNode);
    };

    return (
        <div className="properties-panel">
            <div className="panel-content">
                <h2 className="panel-heading">Properties</h2>

                {selectedNode ? (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Speaker:</label>
                            <input
                                type="text"
                                value={selectedNode.speaker || ""}
                                onChange={(e) => handleInputChange("speaker", e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Text:</label>
                            <textarea
                                value={selectedNode.text}
                                onChange={(e) => handleInputChange("text", e.target.value)}
                                className="form-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="checkbox-container">
                            <div className="checkbox-group">
                                <label className="form-label">
                                    Auto Continue:
                                    <input
                                        type="checkbox"
                                        checked={selectedNode.auto_continue || false}
                                        onChange={(e) => handleInputChange("auto_continue", e.target.checked)}
                                        className="checkbox"
                                    />
                                </label>
                            </div>

                            <div className="checkbox-group">
                                <label className="form-label">
                                    End Dialogue:
                                    <input
                                        type="checkbox"
                                        checked={selectedNode.end_dialogue || false}
                                        onChange={(e) => handleInputChange("end_dialogue", e.target.checked)}
                                        className="checkbox"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Type Speed:</label>
                            <input
                                type="number"
                                value={selectedNode.speed || 0.016}
                                onChange={(e) => handleInputChange("speed", parseFloat(e.target.value))}
                                className="form-input"
                                min="0.005"
                                max="0.5"
                                step="0.001"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Delay (seconds):</label>
                            <input
                                type="number"
                                value={selectedNode.delay || 3}
                                onChange={(e) => handleInputChange("delay", parseFloat(e.target.value))}
                                className="form-input"
                                min="0"
                                step="0.5"
                            />
                        </div>

                        {/* Options section */}
                        {connections.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Dialog Options:</label>
                                <div className="connection-container">
                                    {connections.map((conn) => {
                                        const targetNode = nodes.find(n => n.id === conn.target);
                                        return (
                                            <div key={conn.id} className="connection-item">
                                                <div className="connection-header">
                                                    <span
                                                        className="connection-link"
                                                        onClick={() => onFocusNode(conn.target)}
                                                    >
                                                        Go to: {targetNode?.speaker || 'Node'} #{conn.target}
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Option text for player"
                                                    className="connection-input"
                                                    value={conn.optionText}
                                                    onChange={(e) => onUpdateConnection(conn.id, e.target.value)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="button-group">
                            <button
                                className="btn btn-red"
                                onClick={() => onDeleteNode(selectedNode.id)}
                            >
                                Delete Node
                            </button>
                            <button
                                className="btn btn-blue"
                                onClick={() => onFocusNode(selectedNode.id)}
                            >
                                Center View
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-message">
                        Select a node to edit properties
                    </div>
                )}

                {/* Node navigation section */}
                {nodes.length > 0 && (
                    <div>
                        <h3 className="section-heading">All Nodes</h3>
                        <div className="node-list">
                            {nodes.map(node => (
                                <div
                                    key={node.id}
                                    className={`node-item ${selectedNode && selectedNode.id === node.id ? 'selected' : ''}`}
                                    onClick={() => onFocusNode(node.id)}
                                >
                                    <div className="node-item-name">
                                        {node.speaker || `Node #${node.id}`}
                                    </div>
                                    <div className="node-item-text">
                                        {node.text.substring(0, 40)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;