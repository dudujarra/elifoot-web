/**
 * MonitorView — Telemetria e Diagnóstico OléFUT
 * Stitch v1.1 port (AKITA-393): match docs/stitch-designs/v1.1-all/65-monitor-telemetria-ol-fut.html
 * Tokens-only — zero raw hex (token vars + isolated --ef-mon-* fallbacks).
 * Brand fonts: Outfit / Inter / JetBrains Mono via tokens.
 */

import '../styles/monitor-view.css';

import { useMonitorLogic } from './monitor/useMonitorLogic';
import { MonitorHeader } from './monitor/MonitorHeader';
import { MonitorMetricsGrid } from './monitor/MonitorMetricsGrid';
import { MonitorStatsRow } from './monitor/MonitorStatsRow';
import { MonitorToolbar } from './monitor/MonitorToolbar';
import { MonitorKernelTable } from './monitor/MonitorKernelTable';
import { MonitorFluxHealth } from './monitor/MonitorFluxHealth';
import { MonitorNodeStrip } from './monitor/MonitorNodeStrip';
import { MonitorDetailedEntries } from './monitor/MonitorDetailedEntries';
import { HardDrives } from '@phosphor-icons/react';

export function MonitorView() {
    const {
        engine,
        changeView,
        getDashboardView,
        filter,
        setFilter,
        entries,
        stats,
        refresh,
        handleExport,
        handleClear,
        uptimeStr,
        critCount,
        engineWeek,
        engineSeason,
        engineStatus,
        loadBars,
        healthPct
    } = useMonitorLogic();

    return (
        <div className="ef-anim-fade-in ef-scene-shell ef-mon">
            <div className="ef-mon__scanlines" aria-hidden="true" />
            <div className="ef-view-container ef-view-container--wide">

                <MonitorHeader
                    engineSeason={engineSeason}
                    engineWeek={engineWeek}
                    uptimeStr={uptimeStr}
                    onChangeView={() => changeView(getDashboardView())}
                />

                <MonitorMetricsGrid
                    stats={stats}
                    critCount={critCount}
                    engineStatus={engineStatus}
                    healthPct={healthPct}
                />

                <MonitorStatsRow stats={stats} />

                <MonitorToolbar
                    filter={filter}
                    setFilter={setFilter}
                    refresh={refresh}
                    handleExport={handleExport}
                    handleClear={handleClear}
                />

                <MonitorKernelTable entries={entries} />

                <MonitorFluxHealth
                    loadBars={loadBars}
                    healthPct={healthPct}
                    engineSeason={engineSeason}
                    engineWeek={engineWeek}
                />

                <MonitorNodeStrip engine={engine} />

                <MonitorDetailedEntries entries={entries} />

                {/* Spacer */}
                <div className="ef-mon__footer">
                    <HardDrives size={14} />
                    <span>OléFUT-SYS_32BIT &middot; ROOT_USER &middot; LOCAL_DB</span>
                </div>

            </div>
        </div>
    );
}

export default MonitorView;
