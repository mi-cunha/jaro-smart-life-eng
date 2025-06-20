
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, RotateCcw, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListaComprasStats } from "@/components/ListaCompras/ListaComprasStats";
import { TabelaItensRefeicao } from "@/components/ListaCompras/TabelaItensRefeicao";
import { EstatisticasRefeicao } from "@/components/ListaCompras/EstatisticasRefeicao";
import { ConfiguracoesPessoais } from "@/components/ListaCompras/ConfiguracoesPessoais";
import { ResumoCompra } from "@/components/ListaCompras/ResumoCompra";
import { DicasCompra } from "@/components/ListaCompras/DicasCompra";
import { GerarListaButton } from "@/components/ListaCompras/GerarListaButton";
import { SugerirItemModal } from "@/components/GeradorReceitas/SugerirItemModal";
import { useListaCompras } from "@/hooks/useListaCompras";

const ListaCompras = () => {
  const navigate = useNavigate();
  
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState("none");
  const [restricoesAlimentares, setRestricoesAlimentares] = useState<string[]>([]);
  
  const {
    itensCompra,
    toggleItem,
    toggleTodosItens,
    updatePreco,
    calcularTotal,
    exportarLista,
    adicionarItensGerados,
    adicionarItemSugerido,
    removerItem,
    removerItensSelecionados,
    limparLista
  } = useListaCompras();

  const itensSelecionados = itensCompra.filter(item => item.comprado);
  const temItensSelecionados = itensSelecionados.length > 0;

  const handleLimparLista = async () => {
    if (window.confirm("Are you sure you want to clear the entire shopping list?")) {
      await limparLista();
    }
  };

  const exportarPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #10b981; text-align: center; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
            .total { font-size: 18px; font-weight: bold; color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .category { font-weight: bold; color: #666; }
            .price { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛒 Shopping List</h1>
            <p class="total">Total Items: ${itensCompra.length} | Estimated Total: $${calcularTotal().toFixed(2)}</p>
            <p><em>Generated from your favorite recipes</em></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${itensCompra.map(item => `
                <tr>
                  <td>${item.nome}</td>
                  <td>${item.quantidade}</td>
                  <td class="category">${item.categoria || 'General'}</td>
                  <td class="price">$${item.preco.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Layout title="Smart Shopping List" breadcrumb={["Home", "Shopping List"]}>
      <div className="space-y-4 md:space-y-8 px-2 md:px-0">
        <div className="hidden md:block">
          <ConfiguracoesPessoais
            preferenciasAlimentares={preferenciasAlimentares}
            setPreferenciasAlimentares={setPreferenciasAlimentares}
            restricoesAlimentares={restricoesAlimentares}
            setRestricoesAlimentares={setRestricoesAlimentares}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ListaComprasStats
            totalGeral={calcularTotal()}
            onExportar={exportarPDF}
            onVoltarReceitas={() => navigate("/gerador-receitas")}
          />
        </div>

        {/* Info about shopping list source */}
        <div className="p-3 md:p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
          <p className="text-neon-green text-xs md:text-sm">
            📋 Your shopping list is generated based on all your favorite recipes across all meals.
          </p>
        </div>

        <Card className="bg-dark-bg border-white/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-neon-green" />
                    Shopping List
                  </CardTitle>
                  <GerarListaButton onAddItens={adicionarItensGerados} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <SugerirItemModal
                  refeicoes={["General"]}
                  onAddIngrediente={(_, item) => adicionarItemSugerido(item)}
                />
                <Button
                  onClick={toggleTodosItens}
                  variant="outline"
                  size="sm"
                  className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 text-xs md:text-sm"
                >
                  Select/Unselect All
                </Button>
                {temItensSelecionados && (
                  <Button
                    onClick={removerItensSelecionados}
                    variant="outline"
                    size="sm"
                    className="border-red-400/30 text-red-400 hover:bg-red-400/10 text-xs md:text-sm"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Remove Selected
                  </Button>
                )}
                {itensCompra.length > 0 && (
                  <Button
                    onClick={handleLimparLista}
                    variant="outline"
                    size="sm"
                    className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10 text-xs md:text-sm"
                  >
                    <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            <div className="text-neon-green font-medium text-sm md:text-base">
              Total items: {itensCompra.length} | Estimated total: ${calcularTotal().toFixed(2)}
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {itensCompra.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2 text-sm md:text-base">Your shopping list is empty</p>
                <p className="text-white/40 text-xs md:text-sm">Generate a list from your favorite recipes or add items manually</p>
              </div>
            ) : (
              <>
                <TabelaItensRefeicao
                  itens={itensCompra}
                  onToggleItem={toggleItem}
                  onRemoverItem={removerItem}
                  onUpdatePreco={updatePreco}
                />

                <div className="mt-4 md:mt-6">
                  <EstatisticasRefeicao itens={itensCompra} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {itensCompra.length > 0 && (
          <ResumoCompra
            refeicoes={["General"]}
            calcularTotalRefeicao={() => calcularTotal()}
            calcularTotalGeral={calcularTotal}
            itensPorRefeicao={{ "General": itensCompra }}
          />
        )}

        <DicasCompra />
      </div>
    </Layout>
  );
};

export default ListaCompras;
