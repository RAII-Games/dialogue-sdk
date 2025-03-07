/* types for dialogue system */

export interface DialogueOption {
    text: string;
    next_index?: number;
    end_dialogue?: boolean;
    action?: string; /* string representation as we cannot directory serialize functions */
}

export interface DialogueNode {
    id: number;
    speaker?: string;
    text: string;
    speed?: number;
    options?: DialogueOption[];
    auto_continue?: boolean;
    delay?: number;
    end_dialogue?: boolean;

    /* visual positioning; not part of the final export */
    x: number;
    y: number;
}

export interface Connection {
    id: string;
    source: number;
    target: number;
    optionText?: string;
}

export interface DialogueData {
    nodes: DialogueNode[];
    connections: Connection[];
    nextNodeId: number;
}

/* the final export format in Luau */
export interface LuaDialogueEntry {
    speaker?: string;
    text: string;
    speed?: number;
    options?: DialogueOption[];
    auto_continue?: boolean;
    delay?: number;
    end_dialogue?: boolean;
}