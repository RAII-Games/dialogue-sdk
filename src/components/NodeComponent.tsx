import React from "react";
import { DialogueNode } from "../types/dialogue";

interface NodeComponentProps {
    node: DialogueNode;
    isSelected: boolean;
    isConnecting: boolean;
    isConnectingSource: boolean;
    connectionCount: number;
    onSelect: (e: React.MouseEvent) => void;
    onStartDrag: (e: React.MouseEvent, node: DialogueNode) => void;
    onStartConnect: (node: DialogueNode) => void;
    onFinishConnect: (node: DialogueNode) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
    node,
    isSelected,
    isConnecting,
    isConnectingSource,
    connectionCount,
    onSelect,
    onStartDrag,
    onStartConnect,
    onFinishConnect
}) => {
    const nodeClasses = [
        'node',
        isSelected ? 'node-selected' : '',
        isConnecting ? 'node-connecting' : '',
        isConnectingSource ? 'node-connecting-source' : ''
    ].filter(Boolean).join(' ');

    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onClick={onSelect}
            className={nodeClasses}
            data-node-id={node.id}
        >
            <rect
                width="150"
                height="100"
                rx="5"
                strokeWidth="2"
                data-node-id={node.id}
                onMouseDown={(e) => {
                    if (isConnecting && !isConnectingSource) {
                        e.stopPropagation();
                        onFinishConnect(node);
                    } else {
                        onStartDrag(e, node);
                    }
                }}
            />

            <foreignObject width="150" height="100" data-node-id={node.id}>
                <div className="node-content" data-node-id={node.id}>
                    <div className="node-speaker">
                        {node.speaker || 'No Speaker'}
                    </div>

                    <div className="node-text">
                        {node.text}
                    </div>

                    <div className="node-badges">
                        {node.end_dialogue && (
                            <span className="badge badge-red">
                                End
                            </span>
                        )}
                        {node.auto_continue && (
                            <span className="badge badge-blue">
                                Auto
                            </span>
                        )}
                        {connectionCount > 0 && (
                            <span className="badge badge-green">
                                Options: {connectionCount}
                            </span>
                        )}
                    </div>
                </div>
            </foreignObject>

            <circle
                cx="150"
                cy="50"
                r="7"
                className={`connection-handle ${isConnectingSource ? 'connecting-handle' : ''}`}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onStartConnect(node);
                }}
            />

            <circle
                cx="150"
                cy="50"
                r="12"
                fill="transparent"
                opacity="0"
                className="connection-handle-hover"
                onMouseOver={(e) => {
                    e.currentTarget.setAttribute("opacity", "0.3");
                }}
                onMouseOut={(e) => {
                    e.currentTarget.setAttribute("opacity", "0");
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onStartConnect(node);
                }}
            />
        </g>
    );
};

export default NodeComponent;