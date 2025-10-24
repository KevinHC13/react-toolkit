export type FieldTypeName = 'string' | 'number' | 'boolean' | 'array';

export type FieldDefinition<Name extends string> = {
    name: Name;
    type: FieldTypeName;
    defaultValue?: any;
    dependsOn?: readonly Name[];
}