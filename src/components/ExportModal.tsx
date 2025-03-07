import React, { useRef } from 'react';

interface ExportModalProps {
    code: string;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ code, onClose }) => {
    const codeRef = useRef<HTMLPreElement>(null);

    const copyToClipboard = () => {
        if (navigator.clipboard && codeRef.current) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    const feedback = document.createElement('div');
                    feedback.textContent = 'Copied!';
                    feedback.style.position = 'fixed';
                    feedback.style.bottom = '20px';
                    feedback.style.left = '50%';
                    feedback.style.transform = 'translateX(-50%)';
                    feedback.style.padding = '8px 16px';
                    feedback.style.backgroundColor = '#10b981';
                    feedback.style.color = 'white';
                    feedback.style.borderRadius = '4px';
                    feedback.style.zIndex = '1000';

                    document.body.appendChild(feedback);
                    setTimeout(() => {
                        document.body.removeChild(feedback);
                    }, 2000);
                })
                .catch(() => alert('Failed to copy code. Please select and copy manually.'));
        } else {
            if (codeRef.current) {
                const range = document.createRange();
                range.selectNode(codeRef.current);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
                document.execCommand('copy');
                window.getSelection()?.removeAllRanges();
                alert('Code copied to clipboard!');
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className="modal-content">
                <h2 className="modal-title">Exported Dialogue Code</h2>
                <p className="modal-description">Copy and paste this into your Roblox script:</p>
                <pre ref={codeRef} className="code-block">
                    {code}
                </pre>
                <div className="modal-buttons">
                    <button
                        className="btn btn-gray"
                        onClick={copyToClipboard}
                    >
                        Copy to Clipboard
                    </button>
                    <button
                        className="btn btn-blue"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;