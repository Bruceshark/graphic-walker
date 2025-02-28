import React, { useState, useEffect, forwardRef, useMemo, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { ShadowDom } from '../shadow-dom';
import LeafletRenderer, { LEAFLET_DEFAULT_HEIGHT } from '../components/leafletRenderer';
import { withAppRoot } from '../components/appRoot';
import type { IDarkMode, IViewField, IRow, IThemeKey, DraggableFieldState, IVisualConfig, IVisualConfigNew, IComputationFunction, IVisualLayout, IChannelScales } from '../interfaces';
import type { IReactVegaHandler } from '../vis/react-vega';
import SpecRenderer from './specRenderer';
import { useRenderer } from './hooks';
import { getComputation } from '../computation/clientComputation';
import { getSort } from '../utils';
import { GWGlobalConfig } from '../vis/theme';

type IPureRendererProps =
    | {
          name?: string;
          themeKey?: IThemeKey;
          themeConfig?: GWGlobalConfig;
          dark?: IDarkMode;
          visualState: DraggableFieldState;
          visualConfig: IVisualConfigNew | IVisualConfig;
          visualLayout?: IVisualLayout;
          locale?: string;
          channelScales?: IChannelScales;
      } & (
          | {
                type: 'remote';
                computation: IComputationFunction;
            }
          | {
                type?: 'local';
                rawData: IRow[];
            }
      );

/**
 * Render a readonly chart with given visualization schema.
 * This is a pure component, which means it will not depend on any global state.
 */
const PureRenderer = forwardRef<IReactVegaHandler, IPureRendererProps>(function PureRenderer(props, ref) {
    const { name, themeKey, dark, visualState, visualConfig, visualLayout: layout, locale, type, themeConfig, channelScales } = props;
    const computation = useMemo(() => {
        if (props.type === 'remote') {
            return props.computation;
        }
        return getComputation(props.rawData);
    }, [type, type === 'remote' ? props.computation : props.rawData]);

    const visualLayout = layout ?? (visualConfig as IVisualConfig);

    const sort = getSort(visualState);
    const limit = visualConfig.limit ?? -1;
    const defaultAggregated = visualConfig?.defaultAggregated ?? false;

    const [viewData, setViewData] = useState<IRow[]>([]);
    const { allFields, viewDimensions, viewMeasures, filters } = useMemo(() => {
        const viewDimensions: IViewField[] = [];
        const viewMeasures: IViewField[] = [];

        const { dimensions, measures, filters, ...state } = visualState;
        const allFields = [...dimensions, ...measures];

        const dKeys = Object.keys(state) as (keyof DraggableFieldState)[];
        for (const dKey of dKeys) {
            for (const f of state[dKey]) {
                if (f.analyticType === 'dimension') {
                    viewDimensions.push(f);
                } else if (f.analyticType === 'measure') {
                    viewMeasures.push(f);
                }
            }
        }

        return { allFields, viewDimensions, viewMeasures, filters };
    }, [visualState]);

    const { viewData: data, loading: waiting } = useRenderer({
        allFields,
        viewDimensions,
        viewMeasures,
        filters,
        defaultAggregated,
        sort,
        folds: visualConfig.folds,
        limit,
        computationFunction: computation,
    });
    // Dependencies that should not trigger effect individually
    const latestFromRef = useRef({ data });
    latestFromRef.current = { data };

    useEffect(() => {
        if (waiting === false) {
            unstable_batchedUpdates(() => {
                setViewData(latestFromRef.current.data);
            });
        }
    }, [waiting]);

    const { coordSystem = 'generic' } = visualConfig;
    const isSpatial = coordSystem === 'geographic';

    return (
        <ShadowDom className="flex w-full" style={{ height: '100%' }}>
            <div className="relative flex flex-col w-full flex-1">
                {isSpatial && (
                    <div className="max-w-full" style={{ height: LEAFLET_DEFAULT_HEIGHT, flexGrow: 1 }}>
                        <LeafletRenderer data={data} draggableFieldState={visualState} visualConfig={visualConfig} visualLayout={visualLayout} />
                    </div>
                )}
                {isSpatial || (
                    <SpecRenderer
                        themeConfig={themeConfig}
                        name={name}
                        loading={waiting}
                        data={viewData}
                        ref={ref}
                        themeKey={themeKey}
                        dark={dark}
                        draggableFieldState={visualState}
                        visualConfig={visualConfig}
                        layout={visualLayout}
                        locale={locale ?? 'en-US'}
                        channelScales={channelScales}
                    />
                )}
            </div>
        </ShadowDom>
    );
});

export default observer(withAppRoot<IPureRendererProps>(PureRenderer));
