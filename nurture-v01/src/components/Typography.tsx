import { Fragment } from 'react';

export function Heading({ text, className = '', id }: { text: string; className?: string; id?: string }) {
  return <h2 id={id} className={className} aria-label={text} data-word-reveal>{text.split(' ').map((word, i) => <Fragment key={`${word}-${i}`}><span className="word-mask" aria-hidden="true"><span className="word-inner">{word}</span></span>{' '}</Fragment>)}</h2>;
}
export function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <p className="section-label"><span>{number}</span><span>{children}</span></p>;
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span className="arrow" aria-hidden="true"><img src={`./assets/icons/arrow-${diagonal ? 'up-right' : 'right'}.svg`} alt="" width="20" height="20" /></span>;
}
