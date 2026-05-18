import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { MonitorService } from '../../services/MonitorService';
import { formatUptime } from './monitorUtils';

export function useMonitorLogic() {
    const { changeView, getDashboardView, getEngine } = useGame();
    const engine = getEngine?.() ?? null;
    const [filter, setFilter] = useState('all');
    const [allEntries, setAllEntries] = useState([]);
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [tick, setTick] = useState(0);
    const [sessionStart] = useState(() => Date.now());

    const monitor = useMemo(() => MonitorService.getInstance(), []);

    const refresh = useMemo(() => {
        return () => {
            const all = monitor.getAll();
            setAllEntries([...all]);
            setEntries(filter === 'all' ? all : all.filter(e => e.category === filter));
            setStats(monitor.getStats());
        };
    }, [monitor, filter]);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        refresh();
    }, [refresh]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Uptime tick — refresh every 1s for the live clock display.
    useEffect(() => {
        const id = setInterval(() => setTick(t => (t + 1) % 1000000), 1000);
        return () => clearInterval(id);
    }, []);

    function handleExport() {
        const json = monitor.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `olefut-monitor-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleClear() {
        if (window.confirm(`Apagar ${entries.length} registros do monitor? Esta ação é irreversível.`)) {
            monitor.clear();
            refresh();
        }
    }

    // Telemetry derived from real state — NOT mocked.
    void tick; // re-render every second
    /* eslint-disable react-hooks/purity -- safe derived value for visual telemetry */
    const uptimeMs = Date.now() - sessionStart;
    const uptimeStr = formatUptime(uptimeMs);

    const critCount = useMemo(() => {
        if (!stats) return 0;
        return allEntries.filter(
            e => e.severity === 'critical' || e.severity === 'error'
        ).length;
    }, [allEntries, stats]);

    const engineWeek = engine?.currentWeek ?? 0;
    const engineSeason = engine?.seasonNumber ?? 1;
    const engineStatus = engine ? 'STABLE' : 'OFFLINE';

    // Engine load flux — last 18 buckets of monitor activity per minute.
    const loadBars = useMemo(() => {
        const buckets = new Array(18).fill(0);
        const now = Date.now();
        /* eslint-enable react-hooks/purity */
        const stepMs = 5_000; // 5s buckets => 90s window
        for (const e of allEntries) {
            const ageMs = now - (e.ts || 0);
            if (ageMs < 0) continue;
            const idx = 17 - Math.floor(ageMs / stepMs);
            if (idx >= 0 && idx < 18) buckets[idx] += 1;
        }
        const max = Math.max(1, ...buckets);
        return buckets.map(b => Math.min(95, Math.round((b / max) * 90) + 5));
    }, [allEntries]);

    // System Health = inverse of recent error rate.
    const healthPct = useMemo(() => {
        if (!stats || stats.total === 0) return 100;
        const recent = allEntries.slice(0, 50);
        const errs = recent.filter(
            e => e.severity === 'critical' || e.severity === 'error'
        ).length;
        return Math.max(0, 100 - Math.round((errs / Math.max(1, recent.length)) * 100));
    }, [allEntries, stats]);

    return {
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
    };
}
