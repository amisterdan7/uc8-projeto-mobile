# Auditoria: Padronização e Renomeação de Nomenclatura Sem Alteração de Comportamento

Data: 11/11/2026  
Repositório: `uc8-projeto-mobile`  
Responsável: Engenheiro Mobile Sênior  
Referência Canônica: [`docs/INVENTARIO_NOMES.md`](./INVENTARIO_NOMES.md) e [`docs/DECISOES.md`](./DECISOES.md) (Seção 22)

---

## 1. Verificações de Segurança Iniciais (Saídas Brutas 1.1 a 1.4)

### 1.1. `git status --porcelain`
Saída bruta:
```text
(vazio)
```

### 1.2. `git fetch origin`
Saída bruta:
```text
(vazio)
```

### 1.3. `git log --oneline origin/main..HEAD`
Saída bruta:
```text
dcece48 docs: inventário e decisões de renomeação de nomes sem mudar comportamento
0853b18 test: renomeação de nomes sem mudar comportamento (TST-01)
8491c19 refactor(componentes): renomeação de nomes sem mudar comportamento (CMP-01 a CMP-03)
72d5689 refactor(tipos): renomeação de nomes sem mudar comportamento (TIP-01 a TIP-06)
5c64811 refactor(arquivos): renomeação de nomes sem mudar comportamento (ARQ-01 a ARQ-05)
```

### 1.4. Resolução da BASE e Histórico até HEAD
Comando executado:
```bash
BASE=$(git rev-parse 5c64811^)
git log --oneline -1 $BASE
git log --oneline $BASE..HEAD
```
Saída bruta de `git log --oneline -1 $BASE`:
```text
5e88eb3 chore(limpeza): remove modulo morto acervo, isola ErroDaApi e apaga TelaSobre
```
Saída bruta de `git log --oneline $BASE..HEAD`:
```text
dcece48 docs: inventário e decisões de renomeação de nomes sem mudar comportamento
0853b18 test: renomeação de nomes sem mudar comportamento (TST-01)
8491c19 refactor(componentes): renomeação de nomes sem mudar comportamento (CMP-01 a CMP-03)
72d5689 refactor(tipos): renomeação de nomes sem mudar comportamento (TIP-01 a TIP-06)
5c64811 refactor(arquivos): renomeação de nomes sem mudar comportamento (ARQ-01 a ARQ-05)
```

---

## 2. Itens Aplicados (por ID do Inventário)

| ID | Categoria | Nome Original (Antes) | Nome Atualizado (Depois) | Arquivo(s) Modificado(s) | Status |
|:---|:---|:---|:---|:---|:---:|
| **ARQ-01** | Arquivo | `src/navegacao/NavegadorCurso.tsx` | `src/navegacao/NavegadorPlanos.tsx` | `src/navegacao/NavegadorPlanos.tsx`, `App.tsx` | **APLICADO** |
| **ARQ-02** | Arquivo | `src/navegacao/tiposCurso.ts` | `src/navegacao/tiposPlanos.ts` | `src/navegacao/tiposPlanos.ts`, `src/navegacao/NavegadorPlanos.tsx`, `src/telas/curso/*` | **APLICADO** |
| **ARQ-03** | Arquivo | `src/telas/curso/CartaoPlanoCurso.tsx` | `src/telas/curso/CartaoPlano.tsx` | `src/telas/curso/CartaoPlano.tsx`, `TelaBuscaPlanos.tsx`, `TelaListaPlanos.tsx` | **APLICADO** |
| **ARQ-04** | Arquivo | `src/telas/curso/TelaSobreCurso.tsx` | `src/telas/curso/TelaSobrePlanos.tsx` | `src/telas/curso/TelaSobrePlanos.tsx`, `src/navegacao/NavegadorPlanos.tsx` | **APLICADO** |
| **ARQ-05** | Arquivo | `tests/modoCurso.test.ts` | `tests/modoPlanos.test.ts` | `tests/modoPlanos.test.ts` | **APLICADO** |
| **TIP-01** | Tipo/Interface | `PlanoCurso` | `PlanoAcademia` | `planosSupabase.ts`, `banco.ts`, `PlanosContexto.tsx`, `planosSincronizacao.ts`, `CartaoPlano.tsx`, `modoPlanos.test.ts` | **APLICADO** |
| **TIP-02** | Tipo/Interface | `DadosNovoPlanoCurso` | `DadosNovoPlano` | `planosSupabase.ts`, `banco.ts`, `PlanosContexto.tsx`, `planosSincronizacao.ts`, `modoPlanos.test.ts` | **APLICADO** |
| **TIP-03** | Tipo/Interface | `RotasPilhaPlanosCurso` | `RotasPilhaPlanos` | `tiposPlanos.ts`, `NavegadorPlanos.tsx`, `TelaDetalhePlano.tsx`, `TelaListaPlanos.tsx`, `TelaNovoPlano.tsx` | **APLICADO** |
| **TIP-04** | Tipo/Interface | `AbasCursoParamList` | `AbasPlanosParamList` | `tiposPlanos.ts`, `NavegadorPlanos.tsx` | **APLICADO** |
| **TIP-05** | Tipo/Interface | `NavegacaoAbasCursoProp` | `NavegacaoAbasPlanosProp` | `tiposPlanos.ts`, `TelaBuscaPlanos.tsx` | **APLICADO** |
| **TIP-06** | Tipo/Interface | `CartaoPlanoCursoProps` | `CartaoPlanoProps` | `CartaoPlano.tsx` | **APLICADO** |
| **CMP-01** | Componente | `NavegadorCurso` | `NavegadorPlanos` | `src/navegacao/NavegadorPlanos.tsx`, `App.tsx` | **APLICADO** |
| **CMP-02** | Componente | `CartaoPlanoCurso` | `CartaoPlano` | `src/telas/curso/CartaoPlano.tsx`, `TelaBuscaPlanos.tsx`, `TelaListaPlanos.tsx` | **APLICADO** |
| **CMP-03** | Componente | `TelaSobreCurso` | `TelaSobrePlanos` | `src/telas/curso/TelaSobrePlanos.tsx`, `src/navegacao/NavegadorPlanos.tsx` | **APLICADO** |
| **TST-01** | Teste | `describe('Modo Curso...')` | `describe('Modo Planos (Supabase/SQLite)...')` | `tests/modoPlanos.test.ts` | **APLICADO** |

---

## 3. Linha de Base dos Guias do Curso (Saída Bruta 3.3 salva em `/tmp/saida-antes.txt`)

```text
=== MODULO 6 ===
--- 6.1 git ls-files .env.example .env.local ---
.env.example
--- 6.2 git check-ignore -v .env.local ---
.gitignore:36:.env*.local	.env.local
--- 6.3 apikey e unknown em src/servicos ---
src/servicos/planosSincronizacao.ts:27:  registrarFalha: (origem: string, erro: unknown) => void
src/servicos/planosSincronizacao.ts:33:    } catch (erro: unknown) {
src/servicos/planosSupabase.ts:29:export function descreverErro(erro: unknown): string {
src/servicos/planosSupabase.ts:39:function ehMensagemDeErro(valor: unknown): valor is { message: string } {
src/servicos/planosSupabase.ts:43:    typeof (valor as Record<string, unknown>).message === 'string'
src/servicos/planosSupabase.ts:48:  const corpo: unknown = await resposta.json().catch(() => undefined);
src/servicos/planosSupabase.ts:61:export function ehPlanoRemoto(valor: unknown): valor is PlanoRemoto {
src/servicos/planosSupabase.ts:65:  const campos = valor as Record<string, unknown>;
src/servicos/planosSupabase.ts:75:export function ehListaDePlanos(valor: unknown): valor is PlanoRemoto[] {
src/servicos/planosSupabase.ts:93:): Promise<unknown> {
src/servicos/planosSupabase.ts:98:      apikey: chave,
src/servicos/planosSupabase.ts:117:  const corpo: unknown = await requisitar('planos?select=*&order=id');
src/servicos/planosSupabase.ts:125:  const corpo: unknown = await requisitar(`planos?select=*&id=eq.${id}`);
src/servicos/planosSupabase.ts:134:  const corpo: unknown = await requisitar('planos?select=*', 'POST', dados);
--- 6.4 estados de tela por uniao discriminada ---
src/contexto/AcademiaContexto.tsx:88:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:91:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:94:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:97:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:163:      setEstadoAlunos({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:164:      setEstadoPlanos({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:165:      setEstadoMatriculas({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:166:      setEstadoUsuarios({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:34:  | { tipo: 'carregando' }
src/contexto/PlanosContexto.tsx:35:  | { tipo: 'erro'; mensagem: string }
src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoCurso[]; pendentes: PendentePlano[]; origem: 'nuvem' }
src/contexto/PlanosContexto.tsx:38:      tipo: 'pronto';
src/contexto/PlanosContexto.tsx:55:  const [estado, setEstado] = useState<EstadoPlanos>({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:60:    setEstado({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:73:          setEstado({ tipo: 'pronto', planos, pendentes, origem: 'nuvem' });
src/contexto/PlanosContexto.tsx:88:                tipo: 'pronto',
src/contexto/PlanosContexto.tsx:95:              setEstado({ tipo: 'erro', mensagem: motivo });
src/contexto/PlanosContexto.tsx:101:                tipo: 'erro',
src/telas/TelaAlunos.tsx:227:  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaMatriculas.tsx:199:  // Renderização através de união discriminada e switch exaustivo (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaPlanos.tsx:197:  // Renderizacao atraves de uniao discriminada e switch exaustivo (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaUsuarios.tsx:213:  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/types/estadoTela.ts:7:  | { tipo: 'carregando' }
src/types/estadoTela.ts:8:  | { tipo: 'erro'; mensagem: string }
src/types/estadoTela.ts:9:  | { tipo: 'pronto'; dados: T };
src/types/estadoTela.ts:15:  return { tipo: 'carregando' };
src/types/estadoTela.ts:22:  return { tipo: 'erro', mensagem };
src/types/estadoTela.ts:29:  return { tipo: 'pronto', dados };
--- 6.5 createContext, useContext, Provedor ---
App.tsx:9:import { AcademiaProvedor } from '@/contexto';
App.tsx:11:import { PlanosProvedor } from './src/contexto/PlanosContexto';
App.tsx:59:        <PlanosProvedor>
App.tsx:64:        </PlanosProvedor>
App.tsx:91:        <AcademiaProvedor>
App.tsx:96:        </AcademiaProvedor>
src/auth/SessaoContext.tsx:2:  createContext,
src/auth/SessaoContext.tsx:4:  useContext,
src/auth/SessaoContext.tsx:36:const SessaoContext = createContext<ContextoSessaoData>({} as ContextoSessaoData);
src/auth/SessaoContext.tsx:210:  const contexto = useContext(SessaoContext);
src/contexto/AcademiaContexto.tsx:2:  createContext,
src/contexto/AcademiaContexto.tsx:4:  useContext,
src/contexto/AcademiaContexto.tsx:74:export const AcademiaContexto = createContext<ValorDaAcademia | undefined>(undefined);
src/contexto/AcademiaContexto.tsx:76:interface AcademiaProvedorProps {
src/contexto/AcademiaContexto.tsx:81:export function AcademiaProvedor({
src/contexto/AcademiaContexto.tsx:84:}: AcademiaProvedorProps) {
src/contexto/AcademiaContexto.tsx:433:  const contexto = useContext(AcademiaContexto);
src/contexto/AcademiaContexto.tsx:435:    throw new Error('useAcademia só funciona dentro de AcademiaProvedor');
src/contexto/PlanosContexto.tsx:2:  createContext,
src/contexto/PlanosContexto.tsx:3:  useContext,
src/contexto/PlanosContexto.tsx:52:const PlanosContexto = createContext<ValorDosPlanos | undefined>(undefined);
src/contexto/PlanosContexto.tsx:54:export function PlanosProvedor({ children }: { children: ReactNode }) {
src/contexto/PlanosContexto.tsx:161:  const valor = useContext(PlanosContexto);
src/contexto/PlanosContexto.tsx:163:    throw new Error('usePlanos só funciona dentro de PlanosProvedor');
--- 6.6 hooks de contexto nas telas ---
src/telas/TelaAlunos.tsx:21:import { useAcademia } from '../contexto';
src/telas/TelaAlunos.tsx:49:  } = useAcademia();
src/telas/TelaConta.tsx:18:import { useAcademia } from '@/contexto';
src/telas/TelaConta.tsx:38:  const { trocarSenhaPropria } = useAcademia();
src/telas/TelaDetalheAluno.tsx:18:import { useAcademia } from '@/contexto';
src/telas/TelaDetalheAluno.tsx:57:  } = useAcademia();
src/telas/TelaInicio.tsx:14:import { useAcademia } from '@/contexto';
src/telas/TelaInicio.tsx:66:  const { estadoAlunos, estadoPlanos, recarregarTudo } = useAcademia();
src/telas/TelaMatriculas.tsx:19:import { useAcademia } from '@/contexto';
src/telas/TelaMatriculas.tsx:60:  } = useAcademia();
src/telas/TelaPlanos.tsx:18:import { useAcademia } from '@/contexto';
src/telas/TelaPlanos.tsx:36:  const { estadoPlanos, recarregarPlanos, criarPlano, atualizarPlano, excluirPlano } = useAcademia();
src/telas/TelaUsuarios.tsx:17:import { useAcademia } from '@/contexto';
src/telas/TelaUsuarios.tsx:41:  } = useAcademia();
src/telas/curso/TelaBuscaPlanos.tsx:15:import { usePlanos } from '../../contexto/PlanosContexto';
src/telas/curso/TelaBuscaPlanos.tsx:22:  const { estado } = usePlanos();
src/telas/curso/TelaDetalhePlano.tsx:5:import { usePlanos } from '../../contexto/PlanosContexto';
src/telas/curso/TelaDetalhePlano.tsx:17:  const { buscar } = usePlanos();
src/telas/curso/TelaListaPlanos.tsx:13:import { usePlanos } from '../../contexto/PlanosContexto';
src/telas/curso/TelaListaPlanos.tsx:23:  const { estado, recarregar } = usePlanos();
src/telas/curso/TelaNovoPlano.tsx:5:import { usePlanos } from '../../contexto/PlanosContexto';
src/telas/curso/TelaNovoPlano.tsx:16:  const { incluir } = usePlanos();
=== MODULO 7 ===
--- 7.1 npm ls expo-sqlite ---
uc8-projeto-mobile@1.0.0 /home/amisterdan/Dev/Estudos/Senac/academia-fit/uc8-projeto-mobile
└── expo-sqlite@57.0.4

--- 7.2 openDatabaseAsync e CREATE TABLE ---
src/banco/banco.ts:23:    bancoAberto = SQLite.openDatabaseAsync('planos.db').then(async (db) => {
src/banco/banco.ts:25:        CREATE TABLE IF NOT EXISTS planos (
src/banco/banco.ts:32:        CREATE TABLE IF NOT EXISTS pendentes (
--- 7.3 getAllAsync, getFirstAsync, runAsync ---
src/banco/banco.ts:67:    const linhas = await db.getAllAsync<LinhaPlano>(
src/banco/banco.ts:77:      await db.runAsync('DELETE FROM planos');
src/banco/banco.ts:79:        await db.runAsync(
src/banco/banco.ts:96:    const linha = await db.getFirstAsync<{ total: number }>(
src/banco/banco.ts:105:    db.getAllAsync<PendentePlano>(
src/banco/banco.ts:113:    const resultado = await db.runAsync(
src/banco/banco.ts:123:    await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
--- 7.4 guardarLocal, listarLocal, origem aparelho ---
src/banco/banco.ts:65:export function listarLocal(): Promise<PlanoCurso[]> {
src/banco/banco.ts:74:export function guardarLocal(planos: PlanoCurso[]): Promise<void> {
src/contexto/PlanosContexto.tsx:10:  guardarLocal,
src/contexto/PlanosContexto.tsx:12:  listarLocal,
src/contexto/PlanosContexto.tsx:41:      origem: 'aparelho';
src/contexto/PlanosContexto.tsx:75:        guardarLocal(planos).catch((erro: unknown) => {
src/contexto/PlanosContexto.tsx:81:        Promise.all([listarLocal(), listarPendentes()])
src/contexto/PlanosContexto.tsx:91:                origem: 'aparelho',
--- 7.5 pendentes da fila ---
src/banco/banco.ts:103:export function listarPendentes(): Promise<PendentePlano[]> {
src/banco/banco.ts:111:export function guardarPendente(dados: DadosNovoPlanoCurso): Promise<PendentePlano> {
src/banco/banco.ts:121:export function removerPendente(id: number): Promise<void> {
src/contexto/PlanosContexto.tsx:11:  guardarPendente,
src/contexto/PlanosContexto.tsx:13:  listarPendentes,
src/contexto/PlanosContexto.tsx:14:  removerPendente,
src/contexto/PlanosContexto.tsx:68:        const pendentes = await listarPendentes().catch((erro: unknown) => {
src/contexto/PlanosContexto.tsx:81:        Promise.all([listarLocal(), listarPendentes()])
src/contexto/PlanosContexto.tsx:119:      listarPendentes,
src/contexto/PlanosContexto.tsx:121:      removerPendente,
src/contexto/PlanosContexto.tsx:138:      const pendente = await guardarPendente(dados);
--- 7.6 A enviar e Guardados no aparelho ---
src/telas/curso/TelaListaPlanos.tsx:51:            {estado.origem === 'aparelho' && (
src/telas/curso/TelaListaPlanos.tsx:59:                A enviar ({estado.pendentes.length}):{' '}
src/telas/curso/TelaSobreCurso.tsx:56:        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>
=== MODULO 8 ===
--- 8.1 classificarErro e registrarErro em src ---
src/auth/SessaoContext.tsx:19:import { registrarErro } from '@/erros';
src/auth/SessaoContext.tsx:49:      registrarErro('SessaoContext.sair', e);
src/auth/SessaoContext.tsx:59:      registrarErro('SessaoContext.tratarSessaoExpirada', e);
src/auth/SessaoContext.tsx:73:      registrarErro('SessaoContext.recarregarPermissoes', e);
src/auth/SessaoContext.tsx:77:        registrarErro('SessaoContext.recarregarPermissoes.sair', errSair);
src/auth/SessaoContext.tsx:89:        registrarErro('SessaoContext.callbackSessaoExpirada', e);
src/auth/SessaoContext.tsx:94:        registrarErro('SessaoContext.callbackSemPermissao', e);
src/auth/SessaoContext.tsx:109:              registrarErro('SessaoContext.appStateChange', e);
src/auth/SessaoContext.tsx:143:        registrarErro('SessaoContext.restaurarSessao', e);
src/auth/SessaoContext.tsx:148:          registrarErro('SessaoContext.removerTokenArmazenado', errRemover);
src/auth/SessaoContext.tsx:162:      registrarErro('SessaoContext.restaurarSessaoInvocacao', e);
src/contexto/AcademiaContexto.tsx:21:import { registrarErro } from '@/erros';
src/contexto/AcademiaContexto.tsx:106:      const classificado = registrarErro('AcademiaContexto.listarAlunos', e);
src/contexto/AcademiaContexto.tsx:117:      const classificado = registrarErro('AcademiaContexto.listarPlanos', e);
src/contexto/AcademiaContexto.tsx:128:      const classificado = registrarErro('AcademiaContexto.listarMatriculas', e);
src/contexto/AcademiaContexto.tsx:139:      const classificado = registrarErro('AcademiaContexto.listarUsuarios', e);
src/contexto/AcademiaContexto.tsx:156:      registrarErro('AcademiaContexto.recarregarTudo', e);
src/contexto/AcademiaContexto.tsx:171:      registrarErro('AcademiaContexto.cargaInicial.planos', e);
src/contexto/AcademiaContexto.tsx:174:      registrarErro('AcademiaContexto.cargaInicial.alunos', e);
src/contexto/AcademiaContexto.tsx:177:      registrarErro('AcademiaContexto.cargaInicial.matriculas', e);
src/contexto/AcademiaContexto.tsx:181:        registrarErro('AcademiaContexto.cargaInicial.usuarios', e);
src/contexto/AcademiaContexto.tsx:205:        registrarErro('AcademiaContexto.criarAluno', e);
src/contexto/AcademiaContexto.tsx:219:        registrarErro('AcademiaContexto.atualizarAluno', e);
src/contexto/AcademiaContexto.tsx:232:        registrarErro('AcademiaContexto.arquivarAluno', e);
src/contexto/AcademiaContexto.tsx:245:        registrarErro('AcademiaContexto.restaurarAluno', e);
src/contexto/AcademiaContexto.tsx:258:        registrarErro('AcademiaContexto.excluirAluno', e);
src/contexto/AcademiaContexto.tsx:272:        registrarErro('AcademiaContexto.criarMatricula', e);
src/contexto/AcademiaContexto.tsx:285:        registrarErro('AcademiaContexto.mudarStatusMatricula', e);
src/contexto/AcademiaContexto.tsx:298:        registrarErro('AcademiaContexto.excluirMatricula', e);
src/contexto/AcademiaContexto.tsx:312:        registrarErro('AcademiaContexto.criarPlano', e);
src/contexto/AcademiaContexto.tsx:326:        registrarErro('AcademiaContexto.atualizarPlano', e);
src/contexto/AcademiaContexto.tsx:339:        registrarErro('AcademiaContexto.excluirPlano', e);
src/contexto/AcademiaContexto.tsx:351:        registrarErro('AcademiaContexto.trocarSenhaPropria', e);
src/contexto/AcademiaContexto.tsx:365:        registrarErro('AcademiaContexto.criarUsuario', e);
src/contexto/AcademiaContexto.tsx:379:        registrarErro('AcademiaContexto.alterarAtivoUsuario', e);
src/contexto/AcademiaContexto.tsx:391:        registrarErro('AcademiaContexto.redefinirSenhaUsuario', e);
src/contexto/PlanosContexto.tsx:17:import { ErroDeValidacao, registrarErro } from '../erros/erros';
src/contexto/PlanosContexto.tsx:64:        registrarErro('sincronizar', erro);
src/contexto/PlanosContexto.tsx:69:          registrarErro('pendentes', erro);
src/contexto/PlanosContexto.tsx:76:          registrarErro('guardar no aparelho', erro);
src/contexto/PlanosContexto.tsx:80:        const motivo = registrarErro('carga', erro).mensagem;
src/contexto/PlanosContexto.tsx:102:                mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem,
src/contexto/PlanosContexto.tsx:122:      registrarErro
src/erros/erros.ts:57:export function classificarErro(erro: unknown): ErroClassificado {
src/erros/erros.ts:166:export function registrarErro(origem: string, erro: unknown): ErroClassificado {
src/erros/erros.ts:167:  const classificado = classificarErro(erro);
src/telas/TelaAlunos.tsx:22:import { extrairErrosCampos, registrarErro } from '../erros/erros';
src/telas/TelaAlunos.tsx:83:      registrarErro('TelaAlunos.pullToRefresh', e);
src/telas/TelaAlunos.tsx:141:      registrarErro('cadastro', falha);
src/telas/TelaInicio.tsx:21:import { registrarErro } from '@/erros';
src/telas/TelaInicio.tsx:83:      registrarErro('TelaInicio.refresh', e);
src/telas/TelaLogin.tsx:18:import { registrarErro } from '@/erros';
src/telas/TelaLogin.tsx:62:      const classificado = registrarErro('TelaLogin.entrar', erro);
src/telas/TelaMatriculas.tsx:29:import { extrairErrosCampos, registrarErro } from '../erros/erros';
src/telas/TelaMatriculas.tsx:110:      registrarErro('TelaMatriculas.pullToRefresh', e);
src/telas/TelaMatriculas.tsx:174:      registrarErro('cadastro matricula', falha);
src/telas/TelaPlanos.tsx:25:import { extrairErrosCampos, registrarErro } from '@/erros';
src/telas/TelaPlanos.tsx:62:      registrarErro('TelaPlanos.pullToRefresh', e);
src/telas/TelaUsuarios.tsx:23:import { extrairErrosCampos, registrarErro } from '@/erros';
src/telas/TelaUsuarios.tsx:71:      registrarErro('TelaUsuarios.pullToRefresh', e);
src/telas/curso/TelaNovoPlano.tsx:8:import { registrarErro } from '../../erros/erros';
src/telas/curso/TelaNovoPlano.tsx:78:        const classificado = registrarErro('cadastro', falha);
src/telas/curso/TelaSobreCurso.tsx:11:import { registrarErro } from '../../erros/erros';
src/telas/curso/TelaSobreCurso.tsx:28:          registrarErro('contagem', erro);
--- 8.2 ErroDoBanco em src/banco ---
src/banco/banco.ts:2:import { ErroDoBanco } from '../erros/erros';
src/banco/banco.ts:61:    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
--- 8.3 registrarErro em contexto e telas ---
src/contexto/AcademiaContexto.tsx:21:import { registrarErro } from '@/erros';
src/contexto/AcademiaContexto.tsx:106:      const classificado = registrarErro('AcademiaContexto.listarAlunos', e);
src/contexto/AcademiaContexto.tsx:117:      const classificado = registrarErro('AcademiaContexto.listarPlanos', e);
src/contexto/AcademiaContexto.tsx:128:      const classificado = registrarErro('AcademiaContexto.listarMatriculas', e);
src/contexto/AcademiaContexto.tsx:139:      const classificado = registrarErro('AcademiaContexto.listarUsuarios', e);
src/contexto/AcademiaContexto.tsx:156:      registrarErro('AcademiaContexto.recarregarTudo', e);
src/contexto/AcademiaContexto.tsx:171:      registrarErro('AcademiaContexto.cargaInicial.planos', e);
src/contexto/AcademiaContexto.tsx:174:      registrarErro('AcademiaContexto.cargaInicial.alunos', e);
src/contexto/AcademiaContexto.tsx:177:      registrarErro('AcademiaContexto.cargaInicial.matriculas', e);
src/contexto/AcademiaContexto.tsx:181:        registrarErro('AcademiaContexto.cargaInicial.usuarios', e);
src/contexto/AcademiaContexto.tsx:205:        registrarErro('AcademiaContexto.criarAluno', e);
src/contexto/AcademiaContexto.tsx:219:        registrarErro('AcademiaContexto.atualizarAluno', e);
src/contexto/AcademiaContexto.tsx:232:        registrarErro('AcademiaContexto.arquivarAluno', e);
src/contexto/AcademiaContexto.tsx:245:        registrarErro('AcademiaContexto.restaurarAluno', e);
src/contexto/AcademiaContexto.tsx:258:        registrarErro('AcademiaContexto.excluirAluno', e);
src/contexto/AcademiaContexto.tsx:272:        registrarErro('AcademiaContexto.criarMatricula', e);
src/contexto/AcademiaContexto.tsx:285:        registrarErro('AcademiaContexto.mudarStatusMatricula', e);
src/contexto/AcademiaContexto.tsx:298:        registrarErro('AcademiaContexto.excluirMatricula', e);
src/contexto/AcademiaContexto.tsx:312:        registrarErro('AcademiaContexto.criarPlano', e);
src/contexto/AcademiaContexto.tsx:326:        registrarErro('AcademiaContexto.atualizarPlano', e);
src/contexto/AcademiaContexto.tsx:339:        registrarErro('AcademiaContexto.excluirPlano', e);
src/contexto/AcademiaContexto.tsx:351:        registrarErro('AcademiaContexto.trocarSenhaPropria', e);
src/contexto/AcademiaContexto.tsx:365:        registrarErro('AcademiaContexto.criarUsuario', e);
src/contexto/AcademiaContexto.tsx:379:        registrarErro('AcademiaContexto.alterarAtivoUsuario', e);
src/contexto/AcademiaContexto.tsx:391:        registrarErro('AcademiaContexto.redefinirSenhaUsuario', e);
src/contexto/PlanosContexto.tsx:17:import { ErroDeValidacao, registrarErro } from '../erros/erros';
src/contexto/PlanosContexto.tsx:64:        registrarErro('sincronizar', erro);
src/contexto/PlanosContexto.tsx:69:          registrarErro('pendentes', erro);
src/contexto/PlanosContexto.tsx:76:          registrarErro('guardar no aparelho', erro);
src/contexto/PlanosContexto.tsx:80:        const motivo = registrarErro('carga', erro).mensagem;
src/contexto/PlanosContexto.tsx:102:                mensagem: registrarErro('leitura do aparelho', erroLocal).mensagem,
src/contexto/PlanosContexto.tsx:122:      registrarErro
src/telas/TelaAlunos.tsx:22:import { extrairErrosCampos, registrarErro } from '../erros/erros';
src/telas/TelaAlunos.tsx:83:      registrarErro('TelaAlunos.pullToRefresh', e);
src/telas/TelaAlunos.tsx:141:      registrarErro('cadastro', falha);
src/telas/TelaInicio.tsx:21:import { registrarErro } from '@/erros';
src/telas/TelaInicio.tsx:83:      registrarErro('TelaInicio.refresh', e);
src/telas/TelaLogin.tsx:18:import { registrarErro } from '@/erros';
src/telas/TelaLogin.tsx:62:      const classificado = registrarErro('TelaLogin.entrar', erro);
src/telas/TelaMatriculas.tsx:29:import { extrairErrosCampos, registrarErro } from '../erros/erros';
src/telas/TelaMatriculas.tsx:110:      registrarErro('TelaMatriculas.pullToRefresh', e);
src/telas/TelaMatriculas.tsx:174:      registrarErro('cadastro matricula', falha);
src/telas/TelaPlanos.tsx:25:import { extrairErrosCampos, registrarErro } from '@/erros';
src/telas/TelaPlanos.tsx:62:      registrarErro('TelaPlanos.pullToRefresh', e);
src/telas/TelaUsuarios.tsx:23:import { extrairErrosCampos, registrarErro } from '@/erros';
src/telas/TelaUsuarios.tsx:71:      registrarErro('TelaUsuarios.pullToRefresh', e);
src/telas/curso/TelaNovoPlano.tsx:8:import { registrarErro } from '../../erros/erros';
src/telas/curso/TelaNovoPlano.tsx:78:        const classificado = registrarErro('cadastro', falha);
src/telas/curso/TelaSobreCurso.tsx:11:import { registrarErro } from '../../erros/erros';
src/telas/curso/TelaSobreCurso.tsx:28:          registrarErro('contagem', erro);
--- 8.4 ErroDeValidacao ---
src/contexto/PlanosContexto.tsx:17:import { ErroDeValidacao, registrarErro } from '../erros/erros';
src/erros/erros.ts:12:export class ErroDeValidacao extends Error {
src/erros/erros.ts:15:    this.name = 'ErroDeValidacao';
src/erros/erros.ts:58:  if (erro instanceof ErroDeValidacao) {
src/servicos/planosSincronizacao.ts:1:import { ErroDeValidacao } from '../erros/erros';
src/servicos/planosSincronizacao.ts:10:    throw new ErroDeValidacao('Informe o nome do plano.');
src/servicos/planosSincronizacao.ts:13:    throw new ErroDeValidacao('O preço deve ser um número maior ou igual a zero.');
src/servicos/planosSincronizacao.ts:16:    throw new ErroDeValidacao('A duração deve ser um número inteiro de no mínimo 1 mês.');
--- 8.5 git ls-files docs ---
docs/AGENTES.md
docs/CHECKLIST.md
docs/DECISOES.md
docs/INTEGRACAO_API.md
docs/PEDIDOS_PARA_API.md
docs/roteiro_de_teste.md
--- 8.6 revoke em supabase ---
supabase/esquema.sql:28:revoke update, delete on public.planos from anon;
=== COMPILACAO E QUALIDADE ===
--- tsc --noEmit ---
tsc OK
--- git grep -nw any ---
any: 0 ocorrencias
```

---

## 4. Checagens Obrigatórias Pós-Renomeação (5.1 a 5.5)

### 4.1. Compilação TypeScript (`npm run typecheck`) e Testes Unitários (`npm run test:unit`)
Saída bruta de `npm run typecheck`:
```text
> uc8-projeto-mobile@1.0.0 typecheck
> tsc --noEmit
```
Saída bruta de `npm run test:unit`:
```text
> uc8-projeto-mobile@1.0.0 test:unit
> node --import tsx --test 'tests/*.test.ts'

ℹ tests 90
ℹ suites 25
ℹ pass 90
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
- Total de testes: **90 testes aprovados** em 25 suítes (0 falhas).

### 4.2. Auditoria Estrita de `any` (`git grep -nw any -- "*.ts" "*.tsx"`)
Saída bruta:
```text
(Sem saída — 0 ocorrências de any)
```

### 4.3. Literais de Estado nas Telas da Equipe (`git grep -n "tipo: 'carregando'\|tipo: 'erro'\|tipo: 'pronto'" -- "src"`)
Saída bruta:
```text
src/contexto/AcademiaContexto.tsx:88:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:91:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:94:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:97:    tipo: 'carregando',
src/contexto/AcademiaContexto.tsx:163:      setEstadoAlunos({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:164:      setEstadoPlanos({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:165:      setEstadoMatriculas({ tipo: 'carregando' });
src/contexto/AcademiaContexto.tsx:166:      setEstadoUsuarios({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:34:  | { tipo: 'carregando' }
src/contexto/PlanosContexto.tsx:35:  | { tipo: 'erro'; mensagem: string }
src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoAcademia[]; pendentes: PendentePlano[]; origem: 'nuvem' }
src/contexto/PlanosContexto.tsx:38:      tipo: 'pronto';
src/contexto/PlanosContexto.tsx:55:  const [estado, setEstado] = useState<EstadoPlanos>({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:60:    setEstado({ tipo: 'carregando' });
src/contexto/PlanosContexto.tsx:73:          setEstado({ tipo: 'pronto', planos, pendentes, origem: 'nuvem' });
src/contexto/PlanosContexto.tsx:88:                tipo: 'pronto',
src/contexto/PlanosContexto.tsx:95:              setEstado({ tipo: 'erro', mensagem: motivo });
src/contexto/PlanosContexto.tsx:101:                tipo: 'erro',
src/telas/TelaAlunos.tsx:227:  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaMatriculas.tsx:199:  // Renderização através de união discriminada e switch exaustivo (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaPlanos.tsx:197:  // Renderizacao atraves de uniao discriminada e switch exaustivo (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/telas/TelaUsuarios.tsx:213:  // Renderização por união discriminada (tipo: 'carregando' | tipo: 'erro' | tipo: 'pronto')
src/types/estadoTela.ts:7:  | { tipo: 'carregando' }
src/types/estadoTela.ts:8:  | { tipo: 'erro'; mensagem: string }
src/types/estadoTela.ts:9:  | { tipo: 'pronto'; dados: T };
src/types/estadoTela.ts:15:  return { tipo: 'carregando' };
src/types/estadoTela.ts:22:  return { tipo: 'erro', mensagem };
src/types/estadoTela.ts:29:  return { tipo: 'pronto', dados };
```

### 4.4. Literais Alterados em Relação à Base (5.4) e Análise de Nomes de Rota
Comando executado:
```bash
git diff $BASE -- src App.tsx tests | grep -E "^[-+]" | grep -E "['\"][A-Za-z_/.:-]+['\"]" | grep -vE "^\+\+\+|^---"
```
Saída real:
```diff
-import { NavegadorCurso } from './src/navegacao/NavegadorCurso';
+import { NavegadorPlanos } from './src/navegacao/NavegadorPlanos';
-import type { DadosNovoPlanoCurso, PlanoCurso } from '../servicos/planosSupabase';
+import type { DadosNovoPlano, PlanoAcademia } from '../servicos/planosSupabase';
-  | { tipo: 'pronto'; planos: PlanoCurso[]; pendentes: PendentePlano[]; origem: 'nuvem' }
+  | { tipo: 'pronto'; planos: PlanoAcademia[]; pendentes: PendentePlano[]; origem: 'nuvem' }
-import { TelaSobreCurso } from '../telas/curso/TelaSobreCurso';
-import type { AbasCursoParamList, RotasPilhaPlanosCurso } from './tiposCurso';
+import { TelaSobrePlanos } from '../telas/curso/TelaSobrePlanos';
+import type { AbasPlanosParamList, RotasPilhaPlanos } from './tiposPlanos';
-import { ErroDaApi, type DadosNovoPlanoCurso, type PlanoCurso } from './planosSupabase';
+import { ErroDaApi, type DadosNovoPlano, type PlanoAcademia } from './planosSupabase';
-import type { PlanoCurso } from '../../servicos/planosSupabase';
+import type { PlanoAcademia } from '../../servicos/planosSupabase';
-import { CartaoPlanoCurso } from './CartaoPlanoCurso';
-import type { NavegacaoAbasCursoProp } from '../../navegacao/tiposCurso';
+import { CartaoPlano } from './CartaoPlano';
+import type { NavegacaoAbasPlanosProp } from '../../navegacao/tiposPlanos';
-import type { RotasPilhaPlanosCurso } from '../../navegacao/tiposCurso';
+import type { RotasPilhaPlanos } from '../../navegacao/tiposPlanos';
-type RotaProps = RouteProp<RotasPilhaPlanosCurso, 'DetalhePlano'>;
-type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanosCurso, 'DetalhePlano'>;
+type RotaProps = RouteProp<RotasPilhaPlanos, 'DetalhePlano'>;
+type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanos, 'DetalhePlano'>;
-import { CartaoPlanoCurso } from './CartaoPlanoCurso';
-import type { RotasPilhaPlanosCurso } from '../../navegacao/tiposCurso';
+import { CartaoPlano } from './CartaoPlano';
+import type { RotasPilhaPlanos } from '../../navegacao/tiposPlanos';
-type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanosCurso, 'ListaPlanos'>;
+type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanos, 'ListaPlanos'>;
-import type { RotasPilhaPlanosCurso } from '../../navegacao/tiposCurso';
+import type { RotasPilhaPlanos } from '../../navegacao/tiposPlanos';
-type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanosCurso, 'NovoPlano'>;
+type NavegacaoProps = NativeStackNavigationProp<RotasPilhaPlanos, 'NovoPlano'>;
```

#### Análise dos Literais de Rota:
As linhas com `'DetalhePlano'`, `'ListaPlanos'` e `'NovoPlano'` foram capturadas pelo comando porque contêm esses literais de string em definições de tipos (`RouteProp<..., 'DetalhePlano'>`, `NativeStackNavigationProp<..., '...'>`).
- Os literais de rota em si (`'DetalhePlano'`, `'ListaPlanos'`, `'NovoPlano'`, `'PlanosTab'`, `'Busca'`, `'Sobre'`) **não foram alterados**.
- O que mudou nessas linhas foi exclusivamente o primeiro argumento de tipo genérico (`RotasPilhaPlanosCurso` -> `RotasPilhaPlanos`, item TIP-03 aprovado).
- Todas as chamadas de navegação em tempo de execução mantiveram seus nomes originais:
  - `navigation.navigate('DetalhePlano', { id: item.id })`
  - `navigation.navigate('NovoPlano')`
  - `screen: 'DetalhePlano'`
- Nenhum nome de rota, tabela, URL, banco de dados ou chave foi alterado.

### 4.5. Verificação de Nomes Antigos Remanescentes (5.5)
Comando executado:
```bash
git grep -n "NavegadorCurso\|PlanoCurso\|CartaoPlanoCurso\|TelaSobreCurso\|tiposCurso\|modoCurso\|DadosNovoPlanoCurso\|AbasCursoParamList\|RotasPilhaPlanosCurso" -- src App.tsx tests
```
Saída bruta:
```text
(Sem saída — 0 ocorrências de nomes antigos)
```

---

## 5. Diff da Conferência dos Guias do Curso (Antes x Depois)

Comando executado: `diff -u /tmp/saida-antes.txt /tmp/saida-depois.txt`

Saída bruta:
```diff
--- /tmp/saida-antes.txt	2026-11-11 02:27:09.279960024 -0300
+++ /tmp/saida-depois.txt	2026-11-11 03:11:18.970108025 -0300
@@ -29,7 +29,7 @@
 src/contexto/AcademiaContexto.tsx:166:      setEstadoUsuarios({ tipo: 'carregando' });
 src/contexto/PlanosContexto.tsx:34:  | { tipo: 'carregando' }
 src/contexto/PlanosContexto.tsx:35:  | { tipo: 'erro'; mensagem: string }
-src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoCurso[]; pendentes: PendentePlano[]; origem: 'nuvem' }
+src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoAcademia[]; pendentes: PendentePlano[]; origem: 'nuvem' }
 src/contexto/PlanosContexto.tsx:38:      tipo: 'pronto';
 src/contexto/PlanosContexto.tsx:55:  const [estado, setEstado] = useState<EstadoPlanos>({ tipo: 'carregando' });
 src/contexto/PlanosContexto.tsx:60:    setEstado({ tipo: 'carregando' });
@@ -113,8 +113,8 @@
 src/banco/banco.ts:113:    const resultado = await db.runAsync(
 src/banco/banco.ts:123:    await db.runAsync('DELETE FROM pendentes WHERE id = ?', [id]);
 --- 7.4 guardarLocal, listarLocal, origem aparelho ---
-src/banco/banco.ts:65:export function listarLocal(): Promise<PlanoCurso[]> {
-src/banco/banco.ts:74:export function guardarLocal(planos: PlanoCurso[]): Promise<void> {
+src/banco/banco.ts:65:export function listarLocal(): Promise<PlanoAcademia[]> {
+src/banco/banco.ts:74:export function guardarLocal(planos: PlanoAcademia[]): Promise<void> {
 src/contexto/PlanosContexto.tsx:10:  guardarLocal,
 src/contexto/PlanosContexto.tsx:12:  listarLocal,
 src/contexto/PlanosContexto.tsx:41:      origem: 'aparelho';
@@ -123,7 +123,7 @@
 src/contexto/PlanosContexto.tsx:91:                origem: 'aparelho',
 --- 7.5 pendentes da fila ---
 src/banco/banco.ts:103:export function listarPendentes(): Promise<PendentePlano[]> {
-src/banco/banco.ts:111:export function guardarPendente(dados: DadosNovoPlanoCurso): Promise<PendentePlano> {
+src/banco/banco.ts:111:export function guardarPendente(dados: DadosNovoPlano): Promise<PendentePlano> {
 src/banco/banco.ts:121:export function removerPendente(id: number): Promise<void> {
 src/contexto/PlanosContexto.tsx:11:  guardarPendente,
 src/contexto/PlanosContexto.tsx:13:  listarPendentes,
@@ -136,7 +136,7 @@
 --- 7.6 A enviar e Guardados no aparelho ---
 src/telas/curso/TelaListaPlanos.tsx:51:            {estado.origem === 'aparelho' && (
 src/telas/curso/TelaListaPlanos.tsx:59:                A enviar ({estado.pendentes.length}):{' '}
-src/telas/curso/TelaSobreCurso.tsx:56:        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>
+src/telas/curso/TelaSobrePlanos.tsx:56:        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>
 === MODULO 8 ===
 --- 8.1 classificarErro e registrarErro em src ---
 src/auth/SessaoContext.tsx:19:import { registrarErro } from '@/erros';
@@ -201,8 +201,8 @@
 src/telas/TelaUsuarios.tsx:71:      registrarErro('TelaUsuarios.pullToRefresh', e);
 src/telas/curso/TelaNovoPlano.tsx:8:import { registrarErro } from '../../erros/erros';
 src/telas/curso/TelaNovoPlano.tsx:78:        const classificado = registrarErro('cadastro', falha);
-src/telas/curso/TelaSobreCurso.tsx:11:import { registrarErro } from '../../erros/erros';
-src/telas/curso/TelaSobreCurso.tsx:28:          registrarErro('contagem', erro);
+src/telas/curso/TelaSobrePlanos.tsx:11:import { registrarErro } from '../../erros/erros';
+src/telas/curso/TelaSobrePlanos.tsx:28:          registrarErro('contagem', erro);
 --- 8.2 ErroDoBanco em src/banco ---
 src/banco/banco.ts:2:import { ErroDoBanco } from '../erros/erros';
 src/banco/banco.ts:61:    throw new ErroDoBanco(erro instanceof Error ? erro.message : String(erro));
@@ -255,8 +255,8 @@
 src/telas/TelaUsuarios.tsx:71:      registrarErro('TelaUsuarios.pullToRefresh', e);
 src/telas/curso/TelaNovoPlano.tsx:8:import { registrarErro } from '../../erros/erros';
 src/telas/curso/TelaNovoPlano.tsx:78:        const classificado = registrarErro('cadastro', falha);
-src/telas/curso/TelaSobreCurso.tsx:11:import { registrarErro } from '../../erros/erros';
-src/telas/curso/TelaSobreCurso.tsx:28:          registrarErro('contagem', erro);
+src/telas/curso/TelaSobrePlanos.tsx:11:import { registrarErro } from '../../erros/erros';
+src/telas/curso/TelaSobrePlanos.tsx:28:          registrarErro('contagem', erro);
 --- 8.4 ErroDeValidacao ---
 src/contexto/PlanosContexto.tsx:17:import { ErroDeValidacao, registrarErro } from '../erros/erros';
 src/erros/erros.ts:12:export class ErroDeValidacao extends Error {
@@ -268,9 +268,11 @@
 src/servicos/planosSincronizacao.ts:16:    throw new ErroDeValidacao('A duração deve ser um número inteiro de no mínimo 1 mês.');
 --- 8.5 git ls-files docs ---
 docs/AGENTES.md
+docs/AUDITORIA_PADRONIZACAO_NOMES.md
 docs/CHECKLIST.md
 docs/DECISOES.md
 docs/INTEGRACAO_API.md
+docs/INVENTARIO_NOMES.md
 docs/PEDIDOS_PARA_API.md
 docs/roteiro_de_teste.md
 --- 8.6 revoke em supabase ---
```

### Explicação Detalhada Linha a Linha:
1. **`src/contexto/PlanosContexto.tsx:36`**:
   `- src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoCurso[]; pendentes: PendentePlano[]; origem: 'nuvem' }`
   `+ src/contexto/PlanosContexto.tsx:36:  | { tipo: 'pronto'; planos: PlanoAcademia[]; pendentes: PendentePlano[]; origem: 'nuvem' }`
   - **Explicação:** Renomeação do tipo `PlanoCurso` para `PlanoAcademia` (item TIP-01). O literal de estado procurado pela checagem 6.4 (`tipo: 'pronto'`) permanece intacto.
2. **`src/banco/banco.ts:65, 74`**:
   `- src/banco/banco.ts:65:export function listarLocal(): Promise<PlanoCurso[]> {`
   `- src/banco/banco.ts:74:export function guardarLocal(planos: PlanoCurso[]): Promise<void> {`
   `+ src/banco/banco.ts:65:export function listarLocal(): Promise<PlanoAcademia[]> {`
   `+ src/banco/banco.ts:74:export function guardarLocal(planos: PlanoAcademia[]): Promise<void> {`
   - **Explicação:** Atualização das assinaturas com o tipo renomeado `PlanoAcademia` (item TIP-01). Os termos procurados pela checagem 7.4 (`listarLocal`, `guardarLocal`) permanecem idênticos.
3. **`src/banco/banco.ts:111`**:
   `- src/banco/banco.ts:111:export function guardarPendente(dados: DadosNovoPlanoCurso): Promise<PendentePlano> {`
   `+ src/banco/banco.ts:111:export function guardarPendente(dados: DadosNovoPlano): Promise<PendentePlano> {`
   - **Explicação:** Atualização do tipo do parâmetro de `DadosNovoPlanoCurso` para `DadosNovoPlano` (item TIP-02). O termo procurado pela checagem 7.5 (`guardarPendente`) permanece idêntico.
4. **`src/telas/curso/TelaSobrePlanos.tsx:56` (checagem 7.6)**:
   `- src/telas/curso/TelaSobreCurso.tsx:56:        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>`
   `+ src/telas/curso/TelaSobrePlanos.tsx:56:        <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>`
   - **Explicação:** O arquivo foi renomeado de `TelaSobreCurso.tsx` para `TelaSobrePlanos.tsx` (item ARQ-04). A string procurada pela checagem 7.6 (`Guardados no aparelho`) permanece idêntica.
5. **`src/telas/curso/TelaSobrePlanos.tsx:11, 28` (checagens 8.1 e 8.3)**:
   `- src/telas/curso/TelaSobreCurso.tsx:11:import { registrarErro } from '../../erros/erros';`
   `- src/telas/curso/TelaSobreCurso.tsx:28:          registrarErro('contagem', erro);`
   `+ src/telas/curso/TelaSobrePlanos.tsx:11:import { registrarErro } from '../../erros/erros';`
   `+ src/telas/curso/TelaSobrePlanos.tsx:28:          registrarErro('contagem', erro);`
   - **Explicação:** Ocorrência em `TelaSobrePlanos.tsx` após o renomeio do arquivo (item ARQ-04). O termo procurado pelas checagens 8.1 e 8.3 (`registrarErro`) permanece idêntico.
6. **`docs/AUDITORIA_PADRONIZACAO_NOMES.md` e `docs/INVENTARIO_NOMES.md` (checagem 8.5 `git ls-files docs`)**:
   `+ docs/AUDITORIA_PADRONIZACAO_NOMES.md`
   `+ docs/INVENTARIO_NOMES.md`
   - **Explicação:** Entrada dos arquivos de inventário e auditoria da renomeação no diretório `docs/`.

---

## 6. O que NÃO Foi Verificado (Responsabilidade do Dono)

A validação automatizada garante consistência estrutural, tipagem estrita e execução de testes de unidade. A validação funcional no navegador/dispositivo físico depende da interação humana do dono do projeto, cobrindo especificamente os seguintes casos de teste do [`docs/roteiro_de_teste.md`](./roteiro_de_teste.md):

| ID | Caso de Teste | Procedimento do Roteiro | Resultado Esperado do Roteiro |
|:---|:---|:---|:---|
| **C22** | Cadastro válido aparece na tabela do Supabase | Tocar em Novo Plano; preencher nome, preço, duração e descrição; tocar em Salvar | Plano salvo na nuvem; visível na lista do app e na tabela `planos` do Supabase de exercício |
| **C23** | Campo inválido mostra erro no campo | No formulário de plano, deixar nome em branco ou preço negativo | Mensagem de erro sob o campo correspondente; botão Salvar desabilitado |
| **C25** | Sem rede com cache | Desativar conexão após ter carregado uma vez; abrir app | Lista carrega do SQLite com aviso: "Sem conexão: mostrando os planos guardados no aparelho" |
| **C27** | Cadastro sem rede vai para a fila | Sem conexão; cadastrar novo plano no formulário | Cadastro aceito localmente; adicionado à fila com aviso: "A enviar (1): Nome do Plano" |
| **C28** | Rede de volta sincroniza e a fila esvazia | Reativar rede; tocar em Recarregar na lista | Plano pendente é enviado ao Supabase; removido da tabela de pendentes; aviso "A enviar" some |
| **C30** | Busca | Acessar a aba Busca; digitar termo presente no nome ou na descrição | Planos filtrados em tempo real na grade responsiva |
| **C31** | Contagem no Sobre | Acessar aba Sobre do modo curso | Exibe "Guardados no aparelho: N" com total correto; mostra "indisponível" se banco falhar |

A execução destes testes manuais no ambiente Expo Web ou dispositivo físico deve ser concluída pelo proprietário antes de realizar o envio (`git push`).
