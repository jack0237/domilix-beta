import { useState, useEffect } from 'preact/hooks'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function App() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/count')
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setCount((c) => (c ?? 0) + 1)
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Une erreur est survenue.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Impossible de contacter le serveur. Réessayez plus tard.')
    }
  }

  return (
    <div class="page">
      <nav class="nav">
        <div class="nav-inner">
          <span class="logo">DOMILIX</span>
          <span class="beta-badge">BÊTA</span>
        </div>
      </nav>

      <section class="hero">
        <div class="hero-bg-ring ring-a" aria-hidden="true" />
        <div class="hero-bg-ring ring-b" aria-hidden="true" />

        <div class="hero-content">
          <div class="hero-tag">
            <span class="hero-tag-dot" />
            Programme Testeurs Bêta
          </div>

          <h1 class="hero-title">
            Soyez parmi les premiers<br />
            à découvrir <em>Domilix</em>
          </h1>

          <p class="hero-subtitle">
            L'application immobilière et mobilier haut de gamme pour{' '}
            <strong>Douala</strong> et <strong>Yaoundé</strong>. Accédez à la
            bêta en avant-première et façonnez l'avenir de l'app.
          </p>

          {status === 'success' ? (
            <SuccessCard />
          ) : (
            <form class="signup-form" onSubmit={handleSubmit}>
              <input
                class="email-input"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onInput={(e) =>
                  setEmail((e.target as HTMLInputElement).value)
                }
                required
                disabled={status === 'loading'}
              />
              <button
                class="submit-btn"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <span class="spinner" />
                    En cours…
                  </>
                ) : (
                  'Rejoindre la bêta →'
                )}
              </button>
              {status === 'error' && (
                <p class="error-msg">{errorMsg}</p>
              )}
            </form>
          )}

          {count !== null && count > 0 && (
            <p class="counter">
              <span class="counter-dot" />
              <strong>{count}</strong>{' '}
              {count === 1 ? 'testeur a' : 'testeurs ont'} déjà rejoint
            </p>
          )}
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="visual-ring outer">
            <div class="visual-ring middle">
              <div class="visual-ring inner">
                <div class="visual-core">
                  <span class="logo-mark">D</span>
                </div>
              </div>
            </div>
          </div>
          <FloatingChip label="Immobilier" top="10%" left="0%" delay="0s" />
          <FloatingChip label="Mobilier" top="50%" right="0%" delay="0.3s" />
          <FloatingChip label="Cameroun" bottom="10%" left="15%" delay="0.6s" />
        </div>
      </section>

      <section class="features">
        <h2 class="section-title">Pourquoi rejoindre la bêta ?</h2>
        <div class="cards">
          <FeatureCard
            icon="🏠"
            title="Accès en avant-première"
            desc="Testez toutes les fonctionnalités avant le grand public et influencez directement le développement."
          />
          <FeatureCard
            icon="🛋️"
            title="Mobilier & Immobilier"
            desc="Explorez des propriétés d'exception et des meubles haut de gamme livrés à domicile."
          />
          <FeatureCard
            icon="📍"
            title="Douala & Yaoundé"
            desc="Un catalogue pensé pour les meilleures adresses des deux grandes villes du Cameroun."
          />
        </div>
      </section>

      <section class="steps">
        <h2 class="section-title">Comment ça marche ?</h2>
        <div class="steps-list">
          <Step n={1} title="Inscrivez-vous" desc="Entrez votre adresse Gmail ci-dessus." />
          <div class="step-arrow">→</div>
          <Step n={2} title="Recevez l'invitation" desc="Google Play vous envoie un lien d'accès." />
          <div class="step-arrow">→</div>
          <Step n={3} title="Testez l'app" desc="Installez la bêta et partagez vos retours." />
        </div>
      </section>

      <section class="faq">
        <h2 class="section-title">Questions fréquentes</h2>
        <div class="faq-list">
          <FaqItem
            q="Qu'est-ce que le programme bêta ?"
            a="C'est un accès anticipé à l'application Domilix avant son lancement officiel. Vous testez l'app et partagez vos retours pour nous aider à l'améliorer."
          />
          <FaqItem
            q="Est-ce gratuit ?"
            a="Oui, entièrement gratuit. Vous avez juste besoin d'un appareil Android et d'un compte Google."
          />
          <FaqItem
            q="Comment vais-je recevoir l'invitation ?"
            a="Vous recevrez un e-mail de Google Play vous invitant à rejoindre le programme de test bêta. Suivez simplement le lien pour installer l'application."
          />
          <FaqItem
            q="Quand l'application sera-t-elle disponible ?"
            a="La bêta est déployée très prochainement. Inscrivez-vous maintenant pour être parmi les premiers notifiés !"
          />
          <FaqItem
            q="Dois-je utiliser mon email Gmail ?"
            a="Oui, le programme bêta de Google Play est lié à votre compte Google. Utilisez l'adresse Gmail associée à votre téléphone Android."
          />
        </div>
      </section>

      <footer class="footer">
        <span class="logo footer-logo">DOMILIX</span>
        <p class="footer-tagline">Votre prochaine adresse commence ici.</p>
        <p class="footer-copy">© {new Date().getFullYear()} Domilix. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

function SuccessCard() {
  return (
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h3>Inscription confirmée !</h3>
      <p>
        Vous recevrez une invitation Google Play dès que la bêta est ouverte.
        Gardez un œil sur votre boîte mail.
      </p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  return (
    <div class="card">
      <div class="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div class="step">
      <div class="step-num">{n}</div>
      <h4 class="step-title">{title}</h4>
      <p class="step-desc">{desc}</p>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div class={`faq-item${open ? ' open' : ''}`}>
      <button class="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span class="faq-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <p class="faq-a">{a}</p>}
    </div>
  )
}

function FloatingChip({
  label,
  top,
  bottom,
  left,
  right,
  delay,
}: {
  label: string
  top?: string
  bottom?: string
  left?: string
  right?: string
  delay: string
}) {
  const style = [
    top && `top:${top}`,
    bottom && `bottom:${bottom}`,
    left && `left:${left}`,
    right && `right:${right}`,
    `animation-delay:${delay}`,
  ]
    .filter(Boolean)
    .join(';')

  return (
    <div class="floating-chip" style={style}>
      {label}
    </div>
  )
}
