/* ============================================================
   MOTOR DE SONIDO — sonidos sintetizados, sin archivos externos.
   Reproduce la banda sonora real de una tragamonedas: el sonido
   ascendente de victoria, el "casi" que sube y se corta, y el
   mismo festejo aplicado a una PÉRDIDA disfrazada de ganancia.
   ============================================================ */
const Snd = (function(){
  let ctx = null, activo = true;

  function init(){
    if(!ctx){
      try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ ctx = null; }
    }
    if(ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tono(freq, inicio, dur, tipo, vol){
    if(!ctx || !activo) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'square';
    o.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, ctx.currentTime + inicio + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + inicio); o.stop(ctx.currentTime + inicio + dur + 0.02);
  }
  function barrido(f1, f2, inicio, dur, vol){
    if(!ctx || !activo) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f1, ctx.currentTime + inicio);
    o.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + inicio + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, ctx.currentTime + inicio + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + inicio); o.stop(ctx.currentTime + inicio + dur + 0.02);
  }
  function ruido(inicio, dur, vol){
    if(!ctx || !activo) return;
    const n = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1) * (1 - i/n);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = vol || 0.05;
    s.connect(g); g.connect(ctx.destination);
    s.start(ctx.currentTime + inicio);
  }

  return {
    activar(){ init(); },
    silenciar(v){ activo = !v; },
    estaActivo(){ return activo; },

    girar(){ init(); ruido(0, 0.12, 0.035); tono(180, 0, 0.06, 'square', 0.05); },
    rodillo(){ init(); tono(320, 0, 0.05, 'square', 0.07); ruido(0, 0.04, 0.03); },

    /* mismo festejo para GANANCIA y para PÉRDIDA DISFRAZADA: ese es el punto */
    festejo(){
      init();
      [523.25, 659.25, 783.99, 1046.5].forEach(function(f,i){ tono(f, i*0.09, 0.16, 'square', 0.11); });
    },
    granPremio(){
      init();
      [523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach(function(f,i){ tono(f, i*0.075, 0.2, 'square', 0.12); });
      [0,0.15,0.3,0.45].forEach(function(t){ ruido(t, 0.2, 0.04); });
    },
    /* el casi-acierto: sube como una victoria... y se apaga */
    casi(){
      init();
      tono(523.25, 0, 0.14, 'square', 0.1);
      tono(659.25, 0.1, 0.14, 'square', 0.1);
      barrido(700, 180, 0.24, 0.5, 0.07);
    },
    perder(){ init(); barrido(220, 90, 0, 0.28, 0.06); },
    moneda(){ init(); tono(1046.5, 0, 0.05, 'sine', 0.09); tono(1318.5, 0.04, 0.07, 'sine', 0.08); },
    alerta(){ init(); tono(880, 0, 0.09, 'triangle', 0.08); tono(1174, 0.09, 0.12, 'triangle', 0.08); },
    exito(){
      init();
      [392, 523.25, 659.25, 783.99].forEach(function(f,i){ tono(f, i*0.12, 0.3, 'sine', 0.13); });
    },

    /* ---------- deportivos (JimmyBet) ---------- */
    silbato(){ init(); barrido(2100, 2500, 0, 0.16, 0.05); barrido(2500, 2000, 0.16, 0.14, 0.05); },
    gol(){                       /* rugido de estadio + fanfarria */
      init(); ruido(0, 0.9, 0.05);
      [523.25, 659.25, 783.99, 1046.5].forEach(function(f,i){ tono(f, i*0.1, 0.22, 'square', 0.11); });
    },
    golContra(){                 /* gol en contra: grave y descendente */
      init(); ruido(0, 0.5, 0.04); barrido(300, 90, 0.05, 0.6, 0.08);
    },
    tension(){ init(); tono(196, 0, 0.5, 'triangle', 0.05); tono(207.65, 0.25, 0.5, 'triangle', 0.05); }
  };
})();
