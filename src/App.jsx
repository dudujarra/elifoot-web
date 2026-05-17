import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGame } from './context/GameContext';
import { StartView } from './components/StartView';
import { DashboardView } from './components/DashboardView';
import { Sidebar } from './components/Sidebar';
import { FloatingBugButton } from './components/FloatingBugButton';
import { ChronicleSeasonEndModal } from './components/ChronicleSeasonEndModal';
import { SeasonalEventModal } from './components/SeasonalEventModal';
import { AppHeader } from './components/AppHeader';
import { MonitorService } from './services/MonitorService';
import './styles/app-layout.css';

// AKITA-228: AudioController lazy — Tone.js (345KB) só carrega após primeira nav
const AudioController = lazy(() => import('./audio/AudioController.jsx').then(m => ({ default: m.AudioController })));

const PlayerDashboardView = lazy(() => import('./components/PlayerDashboardView').then(m => ({ default: m.PlayerDashboardView })));
const PlayerMatchView = lazy(() => import('./components/PlayerMatchView').then(m => ({ default: m.PlayerMatchView })));
const SquadView = lazy(() => import('./components/SquadView').then(m => ({ default: m.SquadView })));
const MarketView = lazy(() => import('./components/MarketView').then(m => ({ default: m.MarketView })));
const StandingsView = lazy(() => import('./components/StandingsView').then(m => ({ default: m.StandingsView })));
const MatchView = lazy(() => import('./components/MatchView').then(m => ({ default: m.MatchView })));
const MonitorView = lazy(() => import('./components/MonitorView').then(m => ({ default: m.MonitorView })));
const CosmeticShopView = lazy(() => import('./components/CosmeticShopView').then(m => ({ default: m.CosmeticShopView })));
const AutoPlayView = lazy(() => import('./components/AutoPlayView').then(m => ({ default: m.AutoPlayView })));
const StyleguideView = lazy(() => import('./components/StyleguideView').then(m => ({ default: m.StyleguideView })));
const AchievementsView = lazy(() => import('./components/AchievementsView').then(m => ({ default: m.AchievementsView })));
const TutorialView = lazy(() => import('./components/TutorialView').then(m => ({ default: m.TutorialView })));
const PressView = lazy(() => import('./components/PressView').then(m => ({ default: m.PressView })));
const SaveSlotsView = lazy(() => import('./components/SaveSlotsView').then(m => ({ default: m.SaveSlotsView })));
const RivalriesView = lazy(() => import('./components/RivalriesView').then(m => ({ default: m.RivalriesView })));
const ChronicleView = lazy(() => import('./components/ChronicleView').then(m => ({ default: m.ChronicleView })));
const LineageView = lazy(() => import('./components/LineageView').then(m => ({ default: m.LineageView })));
const AutoPlayLabView = lazy(() => import('./components/AutoPlayLabView').then(m => ({ default: m.AutoPlayLabView })));

const Fallback = () => <div className="app-loading-fallback">CARREGANDO…</div>;

// Install global error handlers (idempotente)
MonitorService.getInstance().install();

function App() {
    const { gameState } = useGame();
    const showChrome = gameState.started && gameState.view !== 'start' && gameState.view !== 'tutorial';

    return (
        <div className="app-shell">
            {/* A11y: Skip to main content link — visible on Tab */}
            <a href="#main-content" className="ef-skip-link">
                Pular para o conteúdo principal
            </a>

            <ChronicleSeasonEndModal />
            <SeasonalEventModal />

            {showChrome && <Sidebar />}

            <div className="app-main-area">
                {gameState.started && <AppHeader />}

                <main id="main-content" className="app-content">
                    <Suspense fallback={<Fallback />}>
                        <Routes>
                            <Route path="/" element={<StartView />} />
                            <Route path="/dashboard" element={<DashboardView />} />
                            <Route path="/player-dashboard" element={<PlayerDashboardView />} />
                            <Route path="/player-match" element={<PlayerMatchView />} />
                            <Route path="/match" element={<MatchView />} />
                            <Route path="/squad" element={<SquadView />} />
                            <Route path="/market" element={<MarketView />} />
                            <Route path="/standings" element={<StandingsView />} />
                            <Route path="/monitor" element={<MonitorView />} />
                            <Route path="/styleguide" element={<StyleguideView />} />
                            <Route path="/achievements" element={<AchievementsView />} />
                            <Route path="/tutorial" element={<TutorialView />} />
                            <Route path="/press" element={<PressView />} />
                            <Route path="/shop" element={<CosmeticShopView />} />
                            <Route path="/autoplay" element={<AutoPlayView />} />
                            <Route path="/saves" element={<SaveSlotsView />} />
                            <Route path="/rivalries" element={<RivalriesView />} />
                            <Route path="/chronicle" element={<ChronicleView />} />
                            <Route path="/lineage" element={<LineageView />} />
                            <Route path="/autoplay-lab" element={<AutoPlayLabView />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </main>

                <FloatingBugButton />
                <Suspense fallback={null}>
                    <AudioController />
                </Suspense>
            </div>
        </div>
    );
}

export default App;
