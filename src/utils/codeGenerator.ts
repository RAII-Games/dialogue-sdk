import { LuaDialogueEntry } from '../types/dialogue';

/* convert a JavaScript value to a Lua representation */
function toLua(value: any): string {
    if (value === undefined || value === null)
        return 'nil';

    if (typeof value === 'boolean')
        return value ? 'true' : 'false';

    if (typeof value === 'number')
        return value.toString();

    if (typeof value === 'string') {
        const escaped = value.replace(/'/g, "\\'");
        return `'${escaped}'`;
    }

    if (Array.isArray(value)) {
        if (value.length === 0)
            return '{}';

        const items = value.map(item => toLua(item)).join(', ');
        return `{${items}}`;
    }

    if (typeof value === 'object') {
        const pairs = Object.entries(value)
            .map(([key, val]) => {
                return `['${key}'] = ${toLua(val)}`; /* use array syntax for keys that are valid identifiers */
            })
            .join(', ');

        return `{${pairs}}`;
    }

    return String(value);
}

/* format an entry as Lua code */
function formatEntryAsLua(entry: LuaDialogueEntry, indent = '    '): string {
    const fields = Object.entries(entry)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${indent}['${key}'] = ${toLua(value)}`)
        .join(',\n');

    return `{\n${fields}\n}`;
}

/* generate Lua code from dialogue entries */
export function generateLuaCode(entries: LuaDialogueEntry[]): string {
    const entriesLua = entries
        .map(entry => formatEntryAsLua(entry))
        .join(',\n');

    return `local dialogue_data = {\n${entriesLua}\n}\n\nreturn dialogue_data`;
}