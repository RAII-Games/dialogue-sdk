import React from 'react';

interface EditorToolbarProps {
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onAddNode: () => void;
    onResetView: () => void;
    onExport: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onAddNode,
    onResetView,
    onExport
}) => {
    return (
        <div className="header">
            <h1 className="title">Dialogue Tree Editor</h1>

            <div className="controls">
                <div className="zoom-control">
                    <span className="zoom-label">Zoom:</span>
                    <button
                        className="zoom-btn"
                        onClick={onZoomOut}
                    >
                        -
                    </button>
                    <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
                    <button
                        className="zoom-btn"
                        onClick={onZoomIn}
                    >
                        +
                    </button>
                </div>

                <button
                    className="btn btn-blue"
                    onClick={onAddNode}
                >
                    Add Node
                </button>

                <button
                    className="btn btn-gray"
                    onClick={onResetView}
                >
                    Reset View
                </button>

                <button
                    className="btn btn-green"
                    onClick={onExport}
                >
                    Export
                </button>
            </div>
        </div>
    );
};

export default EditorToolbar;