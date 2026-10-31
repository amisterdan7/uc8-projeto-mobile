import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
import type { Usuario } from '@/types/entidades';
import {
  autenticarUsuario,
  definirTokenApi,
  mapearUsuario,
  obterDadosUsuarioLogado,
  registrarCallbackSessaoExpirada,
} from '@/api';
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
}

const SessaoContext = createContext<ContextoSessaoData>({} as ContextoSessaoData);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  const sair = useCallback(async () => {
    definirTokenApi(null);
    await removerTokenArmazenado();
    setUsuario(null);
    setPermissoes([]);
  }, []);

  const tratarSessaoExpirada = useCallback(async () => {
    await sair();
    Alert.alert(
      'Sessão expirada',
      'Sua sessão expirou ou suas credenciais não são mais válidas. Por favor, entre novamente.'
    );
  }, [sair]);

  useEffect(() => {
    registrarCallbackSessaoExpirada(tratarSessaoExpirada);
  }, [tratarSessaoExpirada]);

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
      } catch {
        // Token inválido, expirado ou erro de rede inicial
        definirTokenApi(null);
        await removerTokenArmazenado();
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

    restaurarSessao();

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
