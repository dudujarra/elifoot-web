import { ArrowsClockwise, DownloadSimple, Trash } from '@phosphor-icons/react';
import { EfPanel, EfButton } from '../ui';
import { CATEGORIES } from '../../services/MonitorService';
import { CATEGORY_ICONS, CATEGORY_LABELS } from './monitorUtils';

export function MonitorToolbar({ filter, setFilter, refresh, handleExport, handleClear }) {
    return (
        <EfPanel padding="lg" className="ef-mon__toolbar">
            <div className="ef-mon__filter-group">
                {['all', ...Object.values(CATEGORIES)].map(cat => (
                    <EfButton
                        key={cat}
                        variant={filter === cat ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setFilter(cat)}
                        className="ef-mon__filter-btn"
                    >
                        {cat !== 'all' && CATEGORY_ICONS[cat]}
                        {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat] || cat}
                    </EfButton>
                ))}
            </div>

            <div className="ef-mon__action-group">
                <EfButton variant="secondary" size="sm" onClick={refresh}>
                    <ArrowsClockwise size={16} /> ATUALIZAR
                </EfButton>
                <EfButton
                    variant="secondary"
                    size="sm"
                    onClick={handleExport}
                    className="ef-text-info ef-mon__export-btn"
                >
                    <DownloadSimple size={16} /> EXPORTAR JSON
                </EfButton>
                <EfButton
                    variant="danger"
                    size="sm"
                    onClick={handleClear}
                    className="ef-text-danger ef-mon__clear-btn"
                >
                    <Trash size={16} /> LIMPAR
                </EfButton>
            </div>
        </EfPanel>
    );
}
