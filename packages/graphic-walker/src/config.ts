import { DraggableFieldState, IAggregator, ICoordMode, IStackMode, IVisualConfig } from './interfaces';

const GEOM_TYPES: Record<ICoordMode, string[]> = {
    generic: ['auto', 'bar', 'line', 'area', 'trail', 'point', 'circle', 'tick', 'rect', 'arc', 'text', 'boxplot', 'table'],
    geographic: ['poi', 'choropleth'],
};

const COORD_TYPES: ICoordMode[] = ['generic', 'geographic'];

const STACK_MODE: IStackMode[] = ['none', 'stack', 'normalize', 'center'];

const CHART_LAYOUT_TYPE: ('auto' | 'fixed')[] = ['auto', 'fixed'];

const COLORS = {
    // tableau style
    // dimension: 'rgb(73, 150, 178)',
    // measure: 'rgb(0, 177, 128)',
    // dimension: 'rgb(86, 170, 208)',
    // measure: 'rgb(232, 149, 72)'
    dimension: 'rgba(0, 0, 0, 0.9)',
    measure: 'rgba(10, 0, 0, 0.6)',
    black: '#141414',
    white: '#fafafa',
};

const CHANNEL_LIMIT = {
    rows: Infinity,
    columns: Infinity,
    color: 1,
    opacity: 1,
    size: 1,
    shape: 1,
    theta: 1,
    radius: 1,
    details: Infinity,
    text: 1,
};

const META_FIELD_KEYS: Array<keyof DraggableFieldState> = ['dimensions', 'measures'];

const POSITION_CHANNEL_CONFIG_LIST: Array<keyof IVisualConfig['resolve']> = ['x', 'y'];

const NON_POSITION_CHANNEL_CONFIG_LIST: Array<keyof IVisualConfig['resolve']> = ['color', 'opacity', 'shape', 'size'];

const AGGREGATOR_LIST: IAggregator[] = ['sum', 'mean', 'median', 'count', 'min', 'max', 'variance', 'stdev'];

export const GLOBAL_CONFIG = {
    AGGREGATOR_LIST,
    CHART_LAYOUT_TYPE,
    COLORS,
    COORD_TYPES,
    GEOM_TYPES,
    MAX_HISTORY_SIZE: 20,
    STACK_MODE,
    META_FIELD_KEYS,
    CHANNEL_LIMIT,
    POSITION_CHANNEL_CONFIG_LIST,
    NON_POSITION_CHANNEL_CONFIG_LIST,
};

export function getGlobalConfig() {
    return GLOBAL_CONFIG;
}
