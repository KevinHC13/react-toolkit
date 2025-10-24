import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export type FieldTypeName = 'string' | 'number' | 'boolean' | 'array';

export type FieldDefinition<Name extends string> = {
    name: Name;
    type: FieldTypeName;
    defaultValue?: any;
    dependsOn?: readonly Name[];
}


export default function useParamsFilter<
    const F extends readonly FieldDefinition<string>[]
>({ fields }: { fields?: F }) {
    const previousValuesRef = useRef<Record<string, any>>({});
    const [searchParams, setSearchParams] = useSearchParams();

    const firstTimeRef = useRef(true);

    const dependenciesMap = useMemo(() => {
        const map = new Map<string, string[]>()
        fields?.forEach(field => {
            field.dependsOn?.forEach(dep => {
                if (!map.has(dep)) map.set(dep, [])
                map.get(dep)!.push(field.name);
            })
        })
        return map;
    }, [fields])

    // Efecto: inicializar los params si faltan
    useEffect(() => {
        if (firstTimeRef.current && fields?.length) {
            const newParams = new URLSearchParams(searchParams);
            let hasChanges = false
            fields?.forEach(field => {
                const paramValue = searchParams.get(field.name);
                if ((paramValue !== null && paramValue !== undefined)) {
                    previousValuesRef.current[field.name] = deserializeParam(paramValue, field.type);
                } else {
                    if (field.defaultValue !== undefined) {
                        newParams.set(field.name, serializeParam(field.defaultValue, field.type));
                        previousValuesRef.current[field.name] = field.defaultValue;
                        hasChanges = true;
                    }
                }
            });
            if (hasChanges) {
                setSearchParams(newParams);
            }
        }
    }, [fields, searchParams, setSearchParams])

    // Efecto para limpiar campos dependientes cuando cambian sus dependencias
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);

        if (firstTimeRef.current) {
            if (dependenciesMap.size > 0 && newParams.toString() !== '') {
                firstTimeRef.current = false;
            }
            return;
        }
        const newPreviousValues = { ...previousValuesRef.current };
        for (const [dep, dependents] of dependenciesMap) {
            const type = fields?.find(f => f.name === dep)?.type
            if (type === undefined) continue;
            const currentValue = deserializeParam(searchParams.get(dep), type!);
            const previousValue = previousValuesRef.current[dep];

            if (currentValue !== previousValue) {
                dependents.forEach(name => {
                    newPreviousValues[name] = null;
                    newPreviousValues[dep] = currentValue;
                    newParams.delete(name);
                })
                
            }
        }
        setSearchParams(newParams);
        previousValuesRef.current = newPreviousValues;
    }, [searchParams, dependenciesMap]);



    const fieldValues = useMemo(() => {
        const currentState: Record<string, any> = {};
        // Crear el estado actual desde los search params
        fields?.forEach(field => {
            const paramValue = searchParams.get(field.name);
            currentState[field.name] = deserializeParam(paramValue, field.type);
        });

        return currentState as {
            [K in F[number]['name']]:
            Extract<F[number], { name: K }>['type'] extends 'number'
            ? number | null
            : Extract<F[number], { name: K }>['type'] extends 'boolean'
            ? boolean
            : Extract<F[number], { name: K }>['type'] extends 'array'
            ? string[]
            : string | null;
        };
    }, [searchParams, fields]);

    function serializeParam(value: any, type: FieldTypeName) {
        switch (type) {
            case 'array':
                return Array.isArray(value) ? value.join(',') : '';
            case 'boolean':
                return value ? 'true' : 'false';
            case 'number':
                return String(value);
            default:
                return value;
        }
    }

    function deserializeParam(value: string | null, type: FieldTypeName) {
        if (!value) return null;
        switch (type) {
            case 'number':
                return Number(value);
            case 'boolean':
                return value === 'true';
            case 'array':
                return value ? value.split(',') : null;
            default:
                return value;
        }
    }

    const setFieldParam = useCallback( ({ key, value }: { key: string; value: any }) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                newParams.delete(key);
            } else {
                const fieldType = fields?.find(f => f.name === key)?.type;
                if (fieldType) {
                    newParams.set(key, serializeParam(value, fieldType));
                } else {
                    newParams.set(key, String(value));
                }
            }
            return newParams;
        });
    }, [setSearchParams, fields]);

    return {
        fieldValues,
        setFieldParam
    };
}