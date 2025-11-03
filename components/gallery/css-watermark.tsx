/**
 * Watermark diagonal en CSS pur
 * Affiche "© PHOTO SCOLAIRE" répété en diagonale
 */

export function CssWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 flex flex-wrap items-center justify-center">
        {/* Génère un pattern de watermark répété */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-white/30 font-bold text-2xl sm:text-3xl whitespace-nowrap select-none"
            style={{
              transform: `rotate(-45deg) translate(${(i % 4) * 300}px, ${
                Math.floor(i / 4) * 200 - 400
              }px)`,
              transformOrigin: 'center',
            }}
          >
            © PHOTO SCOLAIRE
          </div>
        ))}
      </div>
    </div>
  );
}
