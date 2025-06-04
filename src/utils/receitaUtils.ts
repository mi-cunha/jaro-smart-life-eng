
export const calcularCompatibilidade = (receitaIngredientes: string[], ingredientesDisponiveis: string[]) => {
  const matches = receitaIngredientes.filter(ingredienteReceita => 
    ingredientesDisponiveis.some(ingredienteDisponivel => {
      const nomeReceita = ingredienteReceita.toLowerCase();
      const nomeDisponivel = ingredienteDisponivel.toLowerCase();
      
      // Verificações mais inteligentes de compatibilidade
      return nomeReceita.includes(nomeDisponivel) || 
             nomeDisponivel.includes(nomeReceita) ||
             // Sinônimos comuns
             (nomeReceita.includes('frango') && nomeDisponivel.includes('peito de frango')) ||
             (nomeReceita.includes('oleaginosas') && (nomeDisponivel.includes('castanha') || nomeDisponivel.includes('amêndoa') || nomeDisponivel.includes('noz'))) ||
             (nomeReceita.includes('frutas vermelhas') && (nomeDisponivel.includes('morango') || nomeDisponivel.includes('mirtilo'))) ||
             (nomeReceita.includes('peixe') && (nomeDisponivel.includes('salmão') || nomeDisponivel.includes('tilápia')));
    })
  );
  
  return {
    score: matches.length / receitaIngredientes.length,
    matchedIngredients: matches
  };
};

export const selecionarReceitaInteligente = (
  refeicao: string, 
  ingredientesDisponiveis: string[], 
  receitasBase: any,
  receitasJaGeradas: Set<string>
) => {
  const receitasCandidatas = receitasBase[refeicao as keyof typeof receitasBase] || [];
  
  // Filtra receitas já geradas para evitar repetição
  const receitasDisponiveis = receitasCandidatas.filter((receita: any) => 
    !receitasJaGeradas.has(`${refeicao}-${receita.nome}`)
  );
  
  if (receitasDisponiveis.length === 0) {
    // Se todas as receitas já foram geradas, permite repetir
    return receitasCandidatas[Math.floor(Math.random() * receitasCandidatas.length)];
  }
  
  // Calcula compatibilidade para cada receita disponível
  const receitasComScore = receitasDisponiveis.map((receita: any) => ({
    ...receita,
    compatibilidade: calcularCompatibilidade(receita.ingredientes, ingredientesDisponiveis)
  }));
  
  // Ordena por compatibilidade e seleciona uma das 3 melhores aleatoriamente
  const melhoresReceitas = receitasComScore
    .sort((a, b) => b.compatibilidade.score - a.compatibilidade.score)
    .slice(0, 3);
  
  return melhoresReceitas[Math.floor(Math.random() * melhoresReceitas.length)];
};
