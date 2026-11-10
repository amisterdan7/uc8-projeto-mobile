// Fonte única das skills: .agents/skills. Este script copia para .claude/skills (Claude Code).
// Uso:  node scripts/sincronizar-skills.mjs              copia
//       node scripts/sincronizar-skills.mjs --verificar  só confere (sai com erro se houver diferença)
import fs from 'node:fs'
import path from 'node:path'

const ORIGEM = '.agents/skills'
const DESTINO = '.claude/skills'
const verificar = process.argv.includes('--verificar')

function arquivos(pasta) {
  if (!fs.existsSync(pasta)) return []
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = path.join(pasta, entrada.name)
    return entrada.isDirectory() ? arquivos(caminho) : [caminho]
  })
}

if (!fs.existsSync(ORIGEM)) {
  console.error(`Pasta ${ORIGEM} não encontrada. Rode na raiz do projeto.`)
  process.exit(1)
}

const diferencas = []
for (const arquivo of arquivos(ORIGEM)) {
  const relativo = path.relative(ORIGEM, arquivo)
  const alvo = path.join(DESTINO, relativo)
  const igual = fs.existsSync(alvo) && fs.readFileSync(alvo).equals(fs.readFileSync(arquivo))
  if (igual) continue
  diferencas.push(relativo)
  if (!verificar) {
    fs.mkdirSync(path.dirname(alvo), { recursive: true })
    fs.copyFileSync(arquivo, alvo)
  }
}

// Arquivos que sobraram no destino (a skill foi removida ou renomeada na origem)
const sobras = arquivos(DESTINO)
  .map((a) => path.relative(DESTINO, a))
  .filter((r) => !fs.existsSync(path.join(ORIGEM, r)))
if (!verificar) {
  for (const r of sobras) fs.rmSync(path.join(DESTINO, r))
}

const total = diferencas.length + sobras.length
if (verificar) {
  if (total > 0) {
    console.error(`Skills fora de sincronia (${total}). Rode: npm run skills:sincronizar`)
    for (const d of [...diferencas, ...sobras]) console.error(`  - ${d}`)
    process.exit(1)
  }
  console.log('Skills em sincronia.')
} else {
  console.log(total === 0 ? 'Nada a sincronizar.' : `Sincronizado: ${total} arquivo(s).`)
}
