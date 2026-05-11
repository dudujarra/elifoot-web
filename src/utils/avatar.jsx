import { HIGH_END_FACES } from '../assets/faces/high_end';

function getFaceIndex(name = '') {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % HIGH_END_FACES.length;
}

export function PlayerAvatar({ name, size = 28 }) {
    const faceIndex = getFaceIndex(name);
    const faceSrc = HIGH_END_FACES[faceIndex];

    return (
        <img
            src={faceSrc}
            alt={`Avatar ${name}`}
            className="player-avatar"
            style={{ 
                width: size, 
                height: size, 
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #334155',
                backgroundColor: '#111417',
                imageRendering: 'pixelated'
            }}
        />
    );
}
