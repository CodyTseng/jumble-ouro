const SEED = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const HEX_SEED = 'abcdef0123456789'

export function randomString(len = 32, { hex } = { hex: false }) {
  let str = ''
  const seed = hex ? HEX_SEED : SEED
  for (let i = 0; i < len; i++) {
    str += seed[Math.floor(Math.random() * SEED.length)]
  }
  return str
}
