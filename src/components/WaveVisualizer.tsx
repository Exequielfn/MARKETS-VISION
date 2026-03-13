
interface WaveVisualizerProps {
  isSpeaking: boolean;
}

export function WaveVisualizer({ isSpeaking }: WaveVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-12 w-full max-w-xs mx-auto overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-300 ${
            isSpeaking ? 'animate-wave' : 'h-2 opacity-30'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: isSpeaking ? '1s' : '0ms'
          }}
        />
      ))}
    </div>
  );
}
