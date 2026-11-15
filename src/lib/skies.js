export const SKIES = [
  { id: 'atrium', label: 'Atrium', photo: '/ovs-skies/atrium.jpg' },
  { id: 'glasshouse', label: 'Glasshouse', photo: '/ovs-skies/glasshouse.jpg' },
  { id: 'towers', label: 'Towers', photo: '/ovs-skies/towers.jpg' },
  { id: 'steel', label: 'Steel + sky', photo: '/ovs-skies/steel.jpg' },
  // NASA / Scott Kelly, ISS-43 cupola looking at Earth. Public domain.
  { id: 'cupola', label: 'Cupola', photo: '/ovs-skies/cupola.jpg' },
]

export const GLASSHOUSE = SKIES.find((s) => s.id === 'glasshouse')
export const STEEL = SKIES.find((s) => s.id === 'steel')
export const CUPOLA = SKIES.find((s) => s.id === 'cupola')

export function pickSky() {
  return SKIES[Math.floor(Math.random() * SKIES.length)]
}
