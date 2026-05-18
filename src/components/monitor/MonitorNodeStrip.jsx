import { Database } from '@phosphor-icons/react';

export function MonitorNodeStrip({ engine }) {
    return (
        <div className="ef-mon__node-strip">
            <div className="ef-mon__node-left">
                <div className="ef-mon__node-icon">
                    <Database size={28} />
                </div>
                <div>
                    <div className="ef-mon__node-name">ENGINE_NODE_01</div>
                    <div className="ef-mon__node-status">
                        STATUS: {engine ? 'RUNNING AT PEAK EFFICIENCY' : 'NO ENGINE'}
                    </div>
                </div>
            </div>
            <div className="ef-mon__node-right">
                <div className="ef-mon__node-addr">0x7FFC2A800000</div>
                <div className="ef-mon__node-addr-label">PRIMARY_ADDR_MAPPING</div>
            </div>
        </div>
    );
}
