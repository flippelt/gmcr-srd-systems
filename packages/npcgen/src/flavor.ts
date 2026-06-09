/**
 * Flavor de roleplay (v3): personalidade, motivação, maneirismo, tática e
 * gancho — com sabor por `NameStyle`. Determinístico: com `seed`, usa um roller
 * local; sem seed, usa o RNG global (assim integra com `generateNpc`, que já
 * fixou o RNG a partir do seed do NPC).
 */
import type { NameStyle, NpcFlavor } from './types'
import { pick, seededRoller, type Roller } from './rng'

/** Táticas de combate (genéricas a qualquer sistema). */
const TACTICS: readonly string[] = [
  'Foca no alvo mais fraco primeiro.',
  'Recua para terreno elevado quando ferido.',
  'Luta até a morte, sem recuar.',
  'Usa aliados ou reféns como escudo.',
  'Prefere emboscar a enfrentar de frente.',
  'Protege o líder a qualquer custo.',
]

/** Maneirismos (genéricos). */
const MANNERISMS: readonly string[] = [
  'Fala de si na terceira pessoa.',
  'Mexe constantemente em um amuleto.',
  'Ri nas horas erradas.',
  'Nunca encara nos olhos.',
  'Repete a última palavra do interlocutor.',
  'Cheira o ar antes de falar.',
]

const PERSONALITY: Record<NameStyle, readonly string[]> = {
  fantasy: ['Orgulhoso e territorial', 'Leal até o fim', 'Ganancioso e desconfiado', 'Devoto fanático', 'Covarde mas astuto'],
  'sci-fi': ['Friamente lógico', 'Paranoico com vigilância', 'Obcecado por eficiência', 'Veterano cínico', 'Idealista ingênuo'],
  lovecraftian: ['Tomado por sussurros', 'Calmo de um jeito errado', 'Devoto do indizível', 'À beira do colapso', 'Vazio por dentro'],
  cyberpunk: ['Cínico e mercenário', 'Viciado em adrenalina', 'Leal só ao contrato', 'Niilista estiloso', 'Revoltado com o sistema'],
  plain: ['Reservado', 'Falante e expansivo', 'Irritadiço', 'Calmo e metódico', 'Nervoso'],
}

const MOTIVATION: Record<NameStyle, readonly string[]> = {
  fantasy: ['Proteger o próprio clã', 'Vingar um insulto antigo', 'Acumular ouro', 'Servir um senhor sombrio', 'Provar seu valor'],
  'sci-fi': ['Cumprir a missão a qualquer custo', 'Desertar e sumir', 'Lucrar com a guerra', 'Servir à IA central', 'Achar a colônia perdida'],
  lovecraftian: ['Apaziguar o que dorme', 'Espalhar a verdade revelada', 'Escapar dos sonhos', 'Completar o ritual', 'Esquecer o que viu'],
  cyberpunk: ['Pagar a dívida com a corpo', 'Subir na gangue', 'Vingar um parceiro morto', 'Comprar um corpo novo', 'Derrubar a megacorp'],
  plain: ['Sobreviver', 'Proteger a família', 'Enriquecer', 'Conquistar respeito', 'Fugir do passado'],
}

const HOOK: Record<NameStyle, readonly string[]> = {
  fantasy: ['Carrega um mapa para uma ruína', 'Deve um favor a um dragão', 'Traz a marca de uma profecia', 'Guarda uma relíquia roubada', 'Conhece a entrada secreta do castelo'],
  'sci-fi': ['Tem dados roubados no implante', 'Sabe onde está uma nave fantasma', 'Carrega um vírus dormente', 'Foi clonado sem saber', 'Tem coordenadas de um artefato'],
  lovecraftian: ['Sonha com uma cidade submersa', 'Tem um livro que não devia existir', 'É o último de uma linhagem amaldiçoada', 'Ouve algo que ninguém mais ouve', 'Carrega um ídolo que pulsa'],
  cyberpunk: ['Tem um chip com segredos da corpo', 'É caçado por um fixer', 'Carrega ICE ilegal', 'Conhece um buraco na grade', 'Tem um clone na lista negra'],
  plain: ['Esconde uma dívida perigosa', 'Testemunhou um crime', 'Tem um parente importante', 'Carrega uma carta lacrada', 'Sabe de um esconderijo'],
}

/**
 * Gera flavor de interpretação. Determinístico quando `seed` é informado;
 * senão consome o RNG global (deixa `generateNpc` reger o determinismo).
 */
export function generateFlavor(opts: { style?: NameStyle; seed?: number } = {}): NpcFlavor {
  const style: NameStyle = opts.style ?? 'fantasy'
  const roll: Roller | undefined = opts.seed !== undefined ? seededRoller(opts.seed) : undefined
  const choose = <T>(arr: readonly T[]): T =>
    roll ? arr[roll(arr.length) - 1]! : pick(arr)

  return {
    personality: choose(PERSONALITY[style]),
    motivation: choose(MOTIVATION[style]),
    mannerism: choose(MANNERISMS),
    tactic: choose(TACTICS),
    hook: choose(HOOK[style]),
  }
}

/** Flavor em Markdown (seção "Interpretação") para o codex. */
export function flavorMarkdown(flavor: NpcFlavor): string {
  return [
    '#### Interpretação',
    `- **Personalidade** ${flavor.personality}`,
    `- **Motivação** ${flavor.motivation}`,
    `- **Maneirismo** ${flavor.mannerism}`,
    `- **Tática** ${flavor.tactic}`,
    `- **Gancho** ${flavor.hook}`,
  ].join('\n')
}
