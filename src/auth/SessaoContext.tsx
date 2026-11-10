import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import type { Usuario } from '@/types/entidades';
import {
  autenticarUsuario,
  definirTokenApi,
  mapearUsuario,
  obterDadosUsuarioLogado,
  registrarCallbackSessaoExpirada,
  registrarCallbackSemPermissao,
} from '@/api';
import { registrarErro } from '@/erros';
import {
  obterTokenArmazenado,
  removerTokenArmazenado,
  salvarTokenArmazenado,
} from './armazenamento';

export interface ContextoSessaoData {
  usuario: Usuario | null;
  permissoes: string[];
  carregando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  podeFazer: (acao: string) => boolean;
  recarregarPermissoes: () => Promise<void>;
}

const SessaoContext = createContext<ContextoSessaoData>({} as ContextoSessaoData);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const ultimoFocoRef = useRef(Date.now());

  const sair = useCallback(async () => {
    definirTokenApi(null);
    try {
      await removerTokenArmazenado();
    } catch (e: unknown) {
      registrarErro('SessaoContext.sair', e);
    }
    setUsuario(null);
    setPermissoes([]);
  }, []);

  const tratarSessaoExpirada = useCallback(async () => {
    try {
      await sair();
    } catch (e: unknown) {
      registrarErro('SessaoContext.tratarSessaoExpirada', e);
    }
    Alert.alert(
      'Sessão expirada',
      'Sua sessão expirou ou suas credenciais não são mais válidas. Por favor, entre novamente.'
    );
  }, [sair]);

  const recarregarPermissoes = useCallback(async () => {
    try {
      const respostaEu = await obterDadosUsuarioLogado();
      setUsuario(mapearUsuario(respostaEu.usuario));
      setPermissoes(respostaEu.permissoes ?? []);
    } catch (e: unknown) {
      registrarErro('SessaoContext.recarregarPermissoes', e);
      try {
        await sair();
      } catch (errSair: unknown) {
        registrarErro('SessaoContext.recarregarPermissoes.sair', errSair);
      }
      Alert.alert(
        'Sessão encerrada',
        'Sua sessão não pôde ser revalidada no servidor. Faça login novamente.'
      );
    }
  }, [sair]);

  useEffect(() => {
    registrarCallbackSessaoExpirada(() => {
      tratarSessaoExpirada().catch((e: unknown) => {
        registrarErro('SessaoContext.callbackSessaoExpirada', e);
      });
    });
    registrarCallbackSemPermissao(() => {
      recarregarPermissoes().catch((e: unknown) => {
        registrarErro('SessaoContext.callbackSemPermissao', e);
      });
    });
  }, [tratarSessaoExpirada, recarregarPermissoes]);

  // Ciclo de vida: ao voltar ao primeiro plano depois de mais de 5 minutos, releia /auth/eu (C4)
  useEffect(() => {
    const assinatura = AppState.addEventListener(
      'change',
      (proximoEstado: AppStateStatus) => {
        if (proximoEstado === 'active') {
          const decorrido = Date.now() - ultimoFocoRef.current;
          const cincoMinutos = 5 * 60 * 1000;
          if (decorrido > cincoMinutos && usuario) {
            recarregarPermissoes().catch((e: unknown) => {
              registrarErro('SessaoContext.appStateChange', e);
            });
          }
          ultimoFocoRef.current = Date.now();
        }
      }
    );

    return () => {
      assinatura.remove();
    };
  }, [usuario, recarregarPermissoes]);

  // Carrega sessão ao inicializar o app
  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      try {
        const tokenSalvo = await obterTokenArmazenado();
        if (!tokenSalvo) {
          if (ativo) setCarregando(false);
          return;
        }

        definirTokenApi(tokenSalvo);
        const respostaEu = await obterDadosUsuarioLogado();

        if (ativo) {
          setUsuario(mapearUsuario(respostaEu.usuario));
          setPermissoes(respostaEu.permissoes ?? []);
        }
      } catch (e: unknown) {
        // Token inválido, expirado ou erro de rede inicial
        registrarErro('SessaoContext.restaurarSessao', e);
        definirTokenApi(null);
        try {
          await removerTokenArmazenado();
        } catch (errRemover: unknown) {
          registrarErro('SessaoContext.removerTokenArmazenado', errRemover);
        }
        if (ativo) {
          setUsuario(null);
          setPermissoes([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    restaurarSessao().catch((e: unknown) => {
      registrarErro('SessaoContext.restaurarSessaoInvocacao', e);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(async (login: string, senha: string) => {
    const resposta = await autenticarUsuario(login, senha);
    definirTokenApi(resposta.token);
    await salvarTokenArmazenado(resposta.token);

    setUsuario(mapearUsuario(resposta.usuario));
    setPermissoes(resposta.permissoes ?? []);
  }, []);

  const podeFazer = useCallback(
    (acao: string): boolean => {
      if (!usuario) {
        return false;
      }
      if (usuario.perfil === 'admin' || permissoes.includes('*')) {
        return true;
      }
      return permissoes.includes(acao);
    },
    [usuario, permissoes]
  );

  return (
    <SessaoContext.Provider
      value={{
        usuario,
        permissoes,
        carregando,
        entrar,
        sair,
        podeFazer,
        recarregarPermissoes,
      }}
    >
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao(): ContextoSessaoData {
  const contexto = useContext(SessaoContext);
  if (!contexto) {
    throw new Error('useSessao deve ser utilizado dentro de um SessaoProvider.');
  }
  return contexto;
}
