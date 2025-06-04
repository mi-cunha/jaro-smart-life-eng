
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Heart, BarChart3, Target, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const features = [
    {
      icon: ChefHat,
      title: "Gerador de Receitas",
      description: "Receitas personalizadas baseadas em seus ingredientes e objetivos"
    },
    {
      icon: ShoppingCart,
      title: "Lista de Compras Inteligente",
      description: "Listas automáticas respeitando suas preferências e restrições alimentares"
    },
    {
      icon: Heart,
      title: "Hábitos Saudáveis",
      description: "Acompanhe e desenvolva hábitos que apoiam seu emagrecimento"
    },
    {
      icon: BarChart3,
      title: "Progresso de Peso",
      description: "Monitore sua evolução com gráficos detalhados"
    },
    {
      icon: Target,
      title: "Chá Jaro",
      description: "Receita especial para acelerar seu metabolismo"
    },
    {
      icon: BookOpen,
      title: "Coleção de Receitas",
      description: "Suas receitas favoritas organizadas e sempre acessíveis"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-bg border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            <span className="text-neon-green">Bem-vindo ao JaroSmart!</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-white/80 text-lg mb-4">
              Sua jornada de emagrecimento inteligente começa aqui! 🚀
            </p>
            <p className="text-white/70">
              O JaroSmart é seu assistente pessoal para uma vida mais saudável, 
              combinando tecnologia e nutrição para resultados reais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:border-neon-green/30 transition-all">
                <CardContent className="p-4 text-center">
                  <feature.icon className="w-8 h-8 text-neon-green mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-r from-neon-green/10 to-transparent border border-neon-green/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">🎯 Como funciona:</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• <strong>1.</strong> Configure suas preferências e restrições alimentares</li>
              <li>• <strong>2.</strong> Gere listas de compras personalizadas para cada refeição</li>
              <li>• <strong>3.</strong> Crie receitas saudáveis com os ingredientes disponíveis</li>
              <li>• <strong>4.</strong> Acompanhe seus hábitos e progresso de peso</li>
              <li>• <strong>5.</strong> Aproveite o Chá Jaro para acelerar resultados</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={onClose}
              className="bg-neon-green text-black hover:bg-neon-green/90 text-lg px-8 py-3"
            >
              🚀 Vamos Começar a Jornada JaroSmart!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
