import React from "react";

const EditorInstructions: React.FC = () => {
    return (
        <div className="instructions">
            <p className="instructions-title">How to use the editor:</p>
            <ol className="instructions-list">
                <li>Click and drag nodes to reposition them</li>
                <li>Use Shift + Arrow keys to move the selected node precisely</li>
                <li>Drag from the circle on the right side of a node to connect to another node</li>
                <li>Click a node to edit its properties in the panel</li>
                <li>Click on a connection line to delete it</li>
                <li>Use arrow keys to pan the viewport</li>
                <li>Use + and - keys to zoom in and out</li>
            </ol>
        </div>
    );
};

export default EditorInstructions;