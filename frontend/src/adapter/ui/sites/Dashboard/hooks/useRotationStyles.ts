import { useMemo } from 'react';
import { Layout } from '@domain/entities/Layout';

export interface RotationStyles {
    rotationStyle: React.CSSProperties;
    contentStyle: React.CSSProperties;
    appStyle: React.CSSProperties;
}

type RotationConfig = {
    rotation: Partial<React.CSSProperties>;
    content: Partial<React.CSSProperties>;
    app: Partial<React.CSSProperties>;
};

// Basis-Styles für alle Rotationen
const BASE_STYLES = {
    rotation: {},
    content: {},
    app: {},
} as const;

// Gemeinsame Styles für 90° und 270° Rotationen
const LANDSCAPE_ROTATION_STYLES = {
    rotation: {
        width: '100vh',
        height: '100vw',
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        marginTop: '-50vw',
        marginLeft: '-50vh',
        maxWidth: '100vh',
        maxHeight: '100vw',
        overflowX: 'auto' as const,
        overflowY: 'auto' as const,
        boxSizing: 'border-box' as const,
    },
    content: {
        minWidth: '100%',
        minHeight: '100%',
        width: 'auto',
        height: 'auto',
    },
    app: {
        width: '100%',
        height: '100%',
        minWidth: '100%',
        minHeight: '100%',
        maxWidth: 'none',
        overflow: 'visible' as const,
    },
} as const;

// Konfiguration für jede Rotation
const ROTATION_CONFIGS: Record<number, RotationConfig> = {
    0: {
        rotation: {},
        content: {},
        app: {},
    },
    90: {
        rotation: {
            ...LANDSCAPE_ROTATION_STYLES.rotation,
            transform: 'rotate(90deg)',
        },
        content: LANDSCAPE_ROTATION_STYLES.content,
        app: LANDSCAPE_ROTATION_STYLES.app,
    },
    180: {
        rotation: {
            transform: 'rotate(180deg)',
        },
        content: {},
        app: {},
    },
    270: {
        rotation: {
            ...LANDSCAPE_ROTATION_STYLES.rotation,
            transform: 'rotate(270deg)',
        },
        content: LANDSCAPE_ROTATION_STYLES.content,
        app: LANDSCAPE_ROTATION_STYLES.app,
    },
};

export const useRotationStyles = (layout: Layout | undefined): RotationStyles => {
    return useMemo(() => {
        if (!layout) {
            return {
                rotationStyle: {},
                contentStyle: {},
                appStyle: {},
            };
        }

        const rotation = layout.rotation || 0;
        const config = ROTATION_CONFIGS[rotation] || ROTATION_CONFIGS[0];

        return {
            rotationStyle: { ...BASE_STYLES.rotation, ...config.rotation },
            contentStyle: { ...BASE_STYLES.content, ...config.content },
            appStyle: { ...BASE_STYLES.app, ...config.app },
        };
    }, [layout?.rotation]);
};