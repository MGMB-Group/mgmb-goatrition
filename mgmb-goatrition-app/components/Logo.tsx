import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  linkTo?: string
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { img: 34, textMain: 'text-base', textSub: '0.6em' },
  md: { img: 44, textMain: 'text-xl',   textSub: '0.65em' },
  lg: { img: 60, textMain: 'text-2xl',  textSub: '0.65em' },
}

export default function Logo({
  size = 'md',
  linkTo = '/',
  showText = true,
  className = '',
}: LogoProps) {
  const { img, textMain, textSub } = sizes[size]

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand mark — uses actual MGMB compass emblem, inverted for dark bg */}
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: img, height: img }}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/hRIrngJLhg9hbqbsh6XCf-AbbTCMLoGQSOgPJFNTwuGZdIZjtwsm.png"
          alt="MGMB Goatrition logo — compass rose emblem"
          width={img}
          height={img}
          style={{
            width: img,
            height: img,
            objectFit: 'contain',
            filter: 'invert(1) sepia(1) saturate(5) hue-rotate(320deg)',
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black uppercase text-white ${textMain}`}
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}
          >
            MGMB
          </span>
          <span
            className="font-bold uppercase text-[#dc2626]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: textSub, letterSpacing: '0.18em' }}
          >
            GOATRITION
          </span>
        </div>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="focus:outline-none" aria-label="MGMB Goatrition Home">
        {content}
      </Link>
    )
  }

  return content
}
