import { ATTRIBUTE_CATEGORIES } from '../../engine/PlayerAttributes';
import { useMemo } from 'react';
import '../../styles/player-attributes-grid.css';

const ATTRIBUTE_TRANSLATIONS = {
    // Technical
    crossing: 'Cruzamento',
    dribbling: 'Drible',
    finishing: 'Finalização',
    firstTouch: 'Prim. Toque',
    freeKick: 'C. Falta',
    heading: 'Cabeceio',
    longShots: 'Chute Longe',
    longThrows: 'L. Lateral',
    marking: 'Marcação',
    passing: 'Passe',
    penaltyTaking: 'Pênalti',
    tackling: 'Desarme',
    technique: 'Técnica',
    
    // Mental
    aggression: 'Agressividade',
    anticipation: 'Antecipação',
    bravery: 'Bravura',
    composure: 'Compostura',
    concentration: 'Concentração',
    decisions: 'Decisão',
    determination: 'Determinação',
    flair: 'Imprevisib.',
    leadership: 'Liderança',
    offTheBall: 'Sem Bola',
    positioning: 'Posicion.',
    teamwork: 'Trabalho Eq.',
    vision: 'Visão',
    workRate: 'Índice Trab.',
    
    // Physical
    acceleration: 'Aceleração',
    agility: 'Agilidade',
    balance: 'Equilíbrio',
    jumpingReach: 'Impulsão',
    naturalFitness: 'Aptidão Fís.',
    pace: 'Velocidade',
    stamina: 'Resistência',
    strength: 'Força',
    
    // Goalkeeping
    aerialReach: 'Alc. Aéreo',
    commandOfArea: 'Com. Área',
    communication: 'Comunicação',
    eccentricity: 'Excentricid.',
    handling: 'Manejo',
    kicking: 'Reposição',
    oneOnOnes: 'Um Contra Um',
    reflexes: 'Reflexos',
    rushingOut: 'Saída Gol',
    punching: 'Soco',
    throwing: 'Lançamento'
};

function getAttributeColor(value) {
    if (value >= 16) return 'var(--color-success-mid)';
    if (value >= 11) return 'var(--accent)';
    if (value >= 6) return 'var(--color-amber-warning)';
    return 'var(--danger-aaa)'; // better contrast than --danger on dark bg
}

function AttributeRow({ label, value }) {
    return (
        <div className="ef-attr-row">
            <span className="ef-attr-row-label">{label}</span>
            <span className="ef-attr-row-val ef-dyn-color" style={{ "--ef-dyn-color": getAttributeColor(value) }}>
                {value || '-'}
            </span>
        </div>
    );
}

function CategoryBox({ title, attributes, data }) {
    if (!data) return null;
    return (
        <div className="ef-attr-grid-box">
            <div className="ef-attr-grid-title">
                {title}
            </div>
            <div>
                {attributes.map(key => (
                    <AttributeRow 
                        key={key} 
                        label={ATTRIBUTE_TRANSLATIONS[key] || key} 
                        value={data[key]} 
                    />
                ))}
            </div>
        </div>
    );
}

export function PlayerAttributesGrid({ player }) {
    // Memoize the ensureAttributes logic just in case it's missing (should already be done by engine)
    const attributes = useMemo(() => {
        if (player.attributes && typeof player.attributes === 'object' && player.attributes.technical) {
            return player.attributes;
        }
        return null; // Fallback to avoid crashes if retro-compatibility failed upstream
    }, [player]);

    if (!attributes) {
        return (
            <div className="ef-attr-grid-empty">
                Dados detalhados indisponíveis para este jogador.
            </div>
        );
    }

    const isGk = player.position === 'GOL' || player.naturalPosition === 'GOL' || (player.position && player.position.startsWith('G'));

    return (
        <div className="ef-attr-grid">
            <CategoryBox 
                title="Técnico" 
                attributes={ATTRIBUTE_CATEGORIES.technical} 
                data={attributes.technical} 
            />
            <CategoryBox 
                title="Mental" 
                attributes={ATTRIBUTE_CATEGORIES.mental} 
                data={attributes.mental} 
            />
            <CategoryBox 
                title="Físico" 
                attributes={ATTRIBUTE_CATEGORIES.physical} 
                data={attributes.physical} 
            />
            {isGk && (
                <CategoryBox 
                    title="Goleiro" 
                    attributes={ATTRIBUTE_CATEGORIES.goalkeeping} 
                    data={attributes.goalkeeping} 
                />
            )}
        </div>
    );
}
