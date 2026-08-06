/**
 * Genera una señal sonora suave utilizando la Web Audio API nativa.
 * Crea un tono armónico doble (chime) agradable para avisar el inicio/fin de turno.
 */
export function playSoftChime(isStart: boolean = true): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();

    // Frecuencias para el acorde suave (Do - Mi / C5 - E5)
    const primaryFreq = isStart ? 523.25 : 659.25; // C5 para inicio, E5 para fin
    const secondaryFreq = isStart ? 659.25 : 523.25;

    const now = audioCtx.currentTime;

    // Primer tono
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(primaryFreq, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);

    // Segundo tono (efecto campana/chime suave)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(secondaryFreq, now + 0.15);

    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);

    // Cerrar AudioContext tras la reproducción
    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 1000);
  } catch (err) {
    console.warn('[AudioNotifier] No se pudo reproducir el tono de audio:', err);
  }
}
