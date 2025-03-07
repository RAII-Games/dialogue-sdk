import { useEffect } from 'react';
import { DialogueNode } from '../types/dialogue';

interface KeyboardNavigationProps {
    viewportTransform: { x: number; y: number; scale: number };
    setViewportTransform: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>;
    selectedNode: DialogueNode | null;
    deleteNode: (nodeId: number) => void;
    updateNodePosition?: (nodeId: number, newX: number, newY: number) => void;
    nodes: DialogueNode[];
}

export function useKeyboardNavigation({
    viewportTransform,
    setViewportTransform,
    selectedNode,
    deleteNode,
    updateNodePosition,
    nodes
}: KeyboardNavigationProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA'
            ) {
                return;
            }

            // If Shift is pressed and a node is selected, move the node instead of the viewport
            if (e.shiftKey && selectedNode && updateNodePosition) {
                // Find the most up-to-date node data
                const currentNode = nodes.find(n => n.id === selectedNode.id) || selectedNode;
                const moveStep = 10; // Pixels to move per key press
                
                switch (e.key) {
                    case 'ArrowUp':
                        updateNodePosition(currentNode.id, currentNode.x, currentNode.y - moveStep);
                        e.preventDefault();
                        return;
                    case 'ArrowDown':
                        updateNodePosition(currentNode.id, currentNode.x, currentNode.y + moveStep);
                        e.preventDefault();
                        return;
                    case 'ArrowLeft':
                        updateNodePosition(currentNode.id, currentNode.x - moveStep, currentNode.y);
                        e.preventDefault();
                        return;
                    case 'ArrowRight':
                        updateNodePosition(currentNode.id, currentNode.x + moveStep, currentNode.y);
                        e.preventDefault();
                        return;
                }
            }

            // Regular viewport panning with arrow keys
            const panStep = 50 / viewportTransform.scale;

            switch (e.key) {
                case 'ArrowUp':
                    setViewportTransform((prev) => ({
                        ...prev,
                        y: prev.y + panStep
                    }));
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    setViewportTransform((prev) => ({
                        ...prev,
                        y: prev.y - panStep
                    }));
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    setViewportTransform((prev) => ({
                        ...prev,
                        x: prev.x + panStep
                    }));
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    setViewportTransform((prev) => ({
                        ...prev,
                        x: prev.x - panStep
                    }));
                    e.preventDefault();
                    break;
                case '+':
                case '=':
                    setViewportTransform((prev) => ({
                        ...prev,
                        scale: Math.min(prev.scale + 0.1, 2)
                    }));
                    e.preventDefault();
                    break;
                case '-':
                    setViewportTransform((prev) => ({
                        ...prev,
                        scale: Math.max(prev.scale - 0.1, 0.5)
                    }));
                    e.preventDefault();
                    break;
                case 'Home':
                    setViewportTransform({ x: 0, y: 0, scale: 1 });
                    e.preventDefault();
                    break;
                case 'Delete':
                case 'Backspace':
                    if (selectedNode) {
                        deleteNode(selectedNode.id);
                        e.preventDefault();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [viewportTransform.scale, selectedNode, deleteNode, setViewportTransform, updateNodePosition, nodes]);
}