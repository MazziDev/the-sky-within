import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import TypeIt from 'typeit'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WAVES from 'vanta/dist/vanta.waves.min'
import * as THREE from 'three'

const skyPhrases = [
  'A lua testemunha cada silêncio que te envolve.',
  'Nightmoon — farol brando que serena as marés do coração.',
  'Quando teu nome toca o vento, constelações se alinham.',
]

const App = () => {
  const appRef = useRef(null)
  const vantaRef = useRef(null)
  const introTextRef = useRef(null)
  const messageTextRef = useRef(null)
  const particlesRef = useRef(null)
  const audioContextRef = useRef(null)
  const ambientNodesRef = useRef(null)

  const vantaInstance = useRef(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const moonX = useSpring(pointerX, { stiffness: 120, damping: 14 })
  const moonY = useSpring(pointerY, { stiffness: 120, damping: 14 })

  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => ({
        id: `star-${index}`,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1.2,
        delay: Math.random() * 0.4,
      })),
    [],
  )

  const heartPath = useMemo(() => {
    const points = []
    const segments = 28
    for (let i = 0; i < segments; i += 1) {
      const t = (Math.PI * 2 * i) / segments
      const x = 16 * Math.pow(Math.sin(t), 3)
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      points.push({ x: x / 18, y: -y / 18 })
    }
    return points
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)
    const handler = (event) => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!introTextRef.current) return undefined
    introTextRef.current.innerHTML = ''
    const typeit = new TypeIt(introTextRef.current, {
      strings: ['Há presenças que acendem constelações dentro de nós.'],
      speed: 52,
      lifeLike: true,
      waitUntilVisible: true,
      cursor: false,
    })
      .pause(600)
      .go()

    return () => {
      typeit.destroy()
      if (introTextRef.current) {
        introTextRef.current.innerHTML = ''
      }
    }
  }, [])

  useEffect(() => {
    if (!messageTextRef.current) return undefined
    messageTextRef.current.innerHTML = ''
    const typeit = new TypeIt(messageTextRef.current, {
      strings: ['Se o céu tivesse um coração, pulsaria no mesmo ritmo que o teu.'],
      speed: 48,
      cursor: false,
      waitUntilVisible: true,
    }).go()

    return () => {
      typeit.destroy()
      if (messageTextRef.current) {
        messageTextRef.current.innerHTML = ''
      }
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      if (vantaInstance.current) {
        vantaInstance.current.destroy()
        vantaInstance.current = null
      }
      return undefined
    }

    if (!vantaRef.current || vantaInstance.current) return undefined

    vantaInstance.current = WAVES({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      color: 0x152248,
      shininess: 35,
      waveHeight: 22,
      waveSpeed: 0.85,
      zoom: 1.1,
    })

    return () => {
      if (vantaInstance.current) {
        vantaInstance.current.destroy()
        vantaInstance.current = null
      }
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion || !appRef.current) return undefined
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.star').forEach((star) => {
        gsap.fromTo(
          star,
          { autoAlpha: 0, scale: 0.6 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: star,
              start: 'top bottom',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })

      gsap.utils.toArray('.cosmic-phrase').forEach((phrase, index) => {
        gsap.fromTo(
          phrase,
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: phrase,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            delay: index * 0.12,
          },
        )
      })

      gsap.fromTo(
        '.moon-orbit',
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.moon-orbit',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }, appRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    // Synthesizes a subtle pad so the ambiance works offline without external files.
    if (typeof window === 'undefined' || !window.AudioContext) return undefined

    if (!soundOn) {
      if (ambientNodesRef.current && audioContextRef.current) {
        const { baseGain, oscillators } = ambientNodesRef.current
        const ctx = audioContextRef.current
        baseGain.gain.cancelScheduledValues(ctx.currentTime)
        baseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9)
        oscillators.forEach((osc) => {
          osc.stop(ctx.currentTime + 0.9)
        })
        ambientNodesRef.current = null
      }

      if (audioContextRef.current) {
        audioContextRef.current.suspend().catch(() => {
          /* intencionalmente ignorado */
        })
      }
      return undefined
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }

    const ctx = audioContextRef.current
    ctx.resume().catch(() => {
      /* intencionalmente ignorado */
    })

    const baseGain = ctx.createGain()
    baseGain.gain.value = 0
    baseGain.connect(ctx.destination)

    const createPad = (frequency, detune) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = frequency
      osc.detune.value = detune
      osc.connect(baseGain)
      osc.start()
      return osc
    }

    const oscillators = [
      createPad(128, 4),
      createPad(184, -6),
      createPad(246, 2),
    ]

    baseGain.gain.setValueAtTime(0, ctx.currentTime)
    baseGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2)

    ambientNodesRef.current = { baseGain, oscillators }

    return () => {
      baseGain.gain.cancelScheduledValues(ctx.currentTime)
      baseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
      oscillators.forEach((osc) => {
        osc.stop(ctx.currentTime + 1)
      })
      ambientNodesRef.current = null
    }
  }, [soundOn])

  const handlePointerMove = (event) => {
    if (prefersReducedMotion) return
    const { innerWidth, innerHeight } = window
    const offsetX = ((event.clientX / innerWidth) - 0.5) * 60
    const offsetY = ((event.clientY / innerHeight) - 0.5) * 60
    pointerX.set(offsetX)
    pointerY.set(offsetY)
  }

  const resetParallax = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  const handleEnterNight = () => {
    const skyInterior = document.getElementById('ceu-interior')
    skyInterior?.scrollIntoView({ behavior: 'smooth' })
  }

  const releaseHeartParticles = () => {
    if (!particlesRef.current) return
    const container = particlesRef.current
    const particles = []
    const total = 36

    for (let i = 0; i < total; i += 1) {
      const particle = document.createElement('span')
      particle.className =
        'particle pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-stardust via-white to-lunar opacity-0'
      container.appendChild(particle)
      particles.push(particle)
    }

    particles.forEach((particle, index) => {
      const point = heartPath[index % heartPath.length]
      const x = point.x * 110 + (Math.random() * 18 - 9)
      const y = point.y * 110 + (Math.random() * 18 - 9)

      gsap
        .timeline({
          onComplete: () => particle.remove(),
        })
        .to(particle, {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
        })
        .to(
          particle,
          {
            x,
            y,
            scale: 1.2,
            duration: 1.4,
            ease: 'power2.out',
          },
          '<',
        )
        .to(
          particle,
          {
            opacity: 0,
            scale: 0.4,
            duration: 0.6,
            ease: 'power1.in',
          },
          '-=0.3',
        )
    })
  }

  return (
    <div
      ref={appRef}
      className="min-h-screen overflow-x-hidden bg-midnight font-sans text-white"
    >
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-12 lg:px-20">
        <div ref={vantaRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-space-gradient opacity-[0.55]" />

        <div className="absolute right-6 top-6 z-20">
          <button
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
            className="rounded-full border border-white/20 bg-black/30 px-5 py-2 text-xs uppercase tracking-[0.45em] text-white/70 backdrop-blur-md transition hover:border-white/40 hover:text-white"
          >
            Som ambiente: {soundOn ? 'ligado' : 'desligado'}
          </button>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60 sm:text-sm">
            Noite • Imersão • Presença
          </p>
          <h1 className="mt-6 font-serif text-4xl text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            Nightmoon: The Sky Within
          </h1>
          <p
            ref={introTextRef}
            className="mt-8 text-lg text-white/80 sm:text-xl"
          />

          <div className="mt-12 flex justify-center">
            <motion.button
              type="button"
              onClick={handleEnterNight}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-10 py-4 text-sm uppercase tracking-[0.4em] text-white shadow-lunar backdrop-blur-xl transition"
            >
              <span className="relative z-10">Entrar na Noite</span>
              <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(214, 216, 255, 0.4), transparent 60%)' }} />
            </motion.button>
          </div>
        </div>
      </section>

      <section
        id="ceu-interior"
        className="relative overflow-hidden bg-gradient-to-b from-transparent via-[#0c1328] to-[#050a1a] px-6 py-24 sm:px-12 lg:px-32"
        onPointerMove={handlePointerMove}
        onMouseLeave={resetParallax}
      >
        <div className="pointer-events-none absolute inset-0">
          {stars.map((star) => (
            <span
              key={star.id}
              className="star absolute rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="moon-orbit flex items-center justify-center">
            <motion.div
              className="relative flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-white/90 via-white/60 to-stardust/50 shadow-lunar sm:h-72 sm:w-72"
              style={{ translateX: moonX, translateY: moonY }}
            >
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl" />
              <div className="absolute inset-0 rounded-full border border-white/20" />
              <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-white/25 blur-3xl" aria-hidden="true" />
            </motion.div>
          </div>

          <div className="space-y-12 text-left">
            <div className="flex flex-col gap-8">
              {skyPhrases.map((phrase) => (
                <p
                  key={phrase}
                  className="cosmic-phrase font-serif text-3xl italic text-white drop-shadow-sm sm:text-4xl"
                >
                  {phrase}
                </p>
              ))}
            </div>
            <p className="text-base leading-relaxed text-white/70 sm:text-lg">
              Respire devagar. Cada gesto teu acorda a órbita desta lua,
              recordando que laços luminosos persistem mesmo quando as
              galáxias parecem distantes. Este céu interior se expande para
              acolher nightmoon, presença serena que guia com doçura as noites
              que pedem abrigo.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1433] via-[#1f133d] to-black px-6 py-24 sm:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(155,140,255,0.25),_transparent_60%)] opacity-90" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-4xl text-white sm:text-5xl">
            Mensagem Cósmica
          </h2>
          <p className="mt-6 text-sm uppercase tracking-[0.5em] text-white/50">
            Universo emocional
          </p>

          <p
            ref={messageTextRef}
            className="mt-12 font-serif text-3xl leading-snug text-white/90 sm:text-4xl"
          />

          <div className="relative mt-16 flex justify-center">
            <div ref={particlesRef} className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={releaseHeartParticles}
                className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/80 via-stardust to-white/60 text-midnight shadow-lunar transition hover:shadow-[0_0_45px_rgba(214,216,255,0.55)] sm:h-28 sm:w-28"
                aria-label="Liberar constelação de coração"
              >
                <span className="pointer-events-none text-lg font-semibold tracking-[0.3em] uppercase">
                  *
                </span>
                <span className="absolute inset-1 rounded-full border border-white/30 opacity-0 transition duration-500 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          <p className="mt-14 text-sm text-white/60">
            Que cada batida lembrada permaneça como farol — nightmoon,
            presença constante nas marés mais profundas do coração.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/60 px-6 py-8 text-center text-xs uppercase tracking-[0.4em] text-white/40">
        Nightmoon • The Sky Within • 2025
      </footer>
    </div>
  )
}

export default App
