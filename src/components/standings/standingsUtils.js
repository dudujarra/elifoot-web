export const SERIE_NAMES = { 1: 'SÉRIE A', 2: 'SÉRIE B', 3: 'SÉRIE C', 4: 'SÉRIE D' };

export function getZoneClass(position, totalTeams, division) {
    const isLast = position > totalTeams - 4;
    const isTop4 = position <= 4;
    const isPos5to6 = position === 5 || position === 6;

    if (division === 1) {
        if (isTop4) return 'zone-libertadores';
        if (isPos5to6) return 'zone-suda';
        if (isLast) return 'zone-rebaixamento';
    } else if (division < 4) {
        if (isTop4) return 'zone-promotion';
        if (isLast) return 'zone-rebaixamento';
    } else {
        if (isTop4) return 'zone-promotion';
    }
    return '';
}

export function getZoneRowModifierClass(zoneClass) {
    if (zoneClass.includes('libertadores')) return 'ef-standings__row--zone-libertadores';
    if (zoneClass.includes('suda')) return 'ef-standings__row--zone-suda';
    if (zoneClass.includes('promotion')) return 'ef-standings__row--zone-promotion';
    if (zoneClass.includes('rebaixamento')) return 'ef-standings__row--zone-rebaixamento';
    return 'ef-standings__row--zone-default';
}
