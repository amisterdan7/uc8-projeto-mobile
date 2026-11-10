/**
 * Textos institucionais da Academia MisterFit exibidos na tela Início.
 * Arquivo centralizado para fácil edição pelo proprietário.
 */

export interface ItemOQueOferecemos {
  icone: string;
  titulo: string;
  descricao: string;
}

export interface ConteudoAcademia {
  titulo: string;
  subtitulo: string;
  frase: string;
  oQueOferecemos: ItemOQueOferecemos[];
}

export const CONTEUDO_ACADEMIA: ConteudoAcademia = {
  titulo: 'Academia MisterFit',
  subtitulo: 'Planos acessíveis para você treinar em academias de alto padrão.',
  frase: 'Escolha uma experiência que combine com o seu ritmo.',
  oQueOferecemos: [
    {
      icone: 'location-on',
      titulo: 'Acesso às unidades',
      descricao:
        'Estrutura moderna com equipamentos de musculação e cárdio prontos para o seu treino diário.',
    },
    {
      icone: 'monitor-heart',
      titulo: 'Avaliação física mensal',
      descricao:
        'Acompanhamento periódico de evolução corporal e ajuste de metas junto à equipe.',
    },
    {
      icone: 'phone-iphone',
      titulo: 'App MisterFit',
      descricao:
        'Consulte seu plano, vigência da matrícula e novidades da academia em um só lugar.',
    },
    {
      icone: 'workspace-premium',
      titulo: 'Personal trainer e área VIP',
      descricao:
        'Atendimento exclusivo e acesso à área VIP disponíveis nos planos de maior destaque.',
    },
  ],
};
