import { ArrowLeft, Terminal } from '@phosphor-icons/react';
import { EfPanel, EfButton } from '../ui';

export function MonitorHeader({ engineSeason, engineWeek, uptimeStr, onChangeView }) {
    return (
        <EfPanel padding="lg" className="ef-view-header ef-mon__header">
            <div className="ef-view-header__identity">
                <div className="ef-view-header__icon-box ef-mon__icon-box">
                    <Terminal size={28} className="ef-mon__header-icon" />
                </div>
                <div>
                    <h2 className="ef-view-header__title ef-mon__title">
                        MONITOR &middot; TELEMETRIA OléFUT
                    </h2>
                    <span className="ef-view-header__subtitle ef-mon__subtitle">
                        FM_CORE_v2.0 // SESSION {engineSeason} // WEEK {engineWeek}
                    </span>
                </div>
            </div>
            <div className="ef-mon__header-right">
                <div className="ef-mon__uptime">
                    <span className="ef-mon__uptime-label">UPTIME</span>
                    <span className="ef-mon__uptime-value">{uptimeStr}</span>
                </div>
                <div className="ef-mon__sys-active">
                    <div className="ef-mon__sys-dot" />
                    <span>SYS_ACTIVE</span>
                </div>
                <EfButton variant="secondary" size="md" onClick={onChangeView}>
                    <ArrowLeft size={16} /> SAIR
                </EfButton>
            </div>
        </EfPanel>
    );
}
