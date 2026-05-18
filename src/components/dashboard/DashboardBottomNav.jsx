import { EfButton } from '../ui/EfButton';
import { Users, ShoppingCart, ChartBar } from '@phosphor-icons/react';

export function DashboardBottomNav({ changeView }) {
    const navItems = [
        { view: 'squad', icon: <Users weight="fill" />, label: 'Plantel' },
        { view: 'market', icon: <ShoppingCart weight="fill" />, label: 'Mercado' },
        { view: 'standings', icon: <ChartBar weight="fill" />, label: 'Tabela' }
    ];

    return (
        <div className="ef-dashboard-bottom-nav">
            {navItems.map((n) => (
                <EfButton key={n.view} variant="secondary" size="lg" className="ef-flex-1 ef-dashboard-bottom-nav__btn" onClick={() => changeView(n.view)}>
                    {n.icon} {n.label}
                </EfButton>
            ))}
        </div>
    );
}
