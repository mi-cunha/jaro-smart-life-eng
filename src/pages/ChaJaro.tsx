
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Cup, Clock, Flame, Droplets, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ChaJaro = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [doses, setDoses] = useState<{ [key: string]: number }>({
    '2024-01-15': 6,
    '2024-01-14': 4,
    '2024-01-13': 5,
    '2024-01-12': 3,
    '2024-01-11': 6,
  });

  const today = new Date().toISOString().split('T')[0];
  const todayDoses = doses[today] || 4;

  const ingredients = [
    "2 colheres de sopa de folhas de chá verde",
    "1 pedaço de gengibre fresco (2cm)",
    "1 pau de canela",
    "1 colher de chá de cúrcuma em pó",
    "500ml de água filtrada",
    "Mel ou stevia a gosto (opcional)"
  ];

  const preparationSteps = [
    { icon: <Droplets className="w-4 h-4" />, text: "Ferva a água em uma panela" },
    { icon: <Cup className="w-4 h-4" />, text: "Adicione o gengibre e a canela" },
    { icon: <Flame className="w-4 h-4" />, text: "Deixe ferver por 3 minutos" },
    { icon: <Cup className="w-4 h-4" />, text: "Adicione o chá verde e cúrcuma" },
    { icon: <Clock className="w-4 h-4" />, text: "Abafe por 5 minutos" },
    { icon: <CheckCircle className="w-4 h-4" />, text: "Coe e sirva morno" }
  ];

  const benefits = [
    { component: "Chá Verde", quantidade: "500mg", funcao: "Acelera o metabolismo" },
    { component: "Gengibre", quantidade: "2g", funcao: "Anti-inflamatório" },
    { component: "Canela", quantidade: "1g", funcao: "Controle glicêmico" },
    { component: "Cúrcuma", quantidade: "1g", funcao: "Antioxidante" }
  ];

  const handleMarcarDose = () => {
    if (todayDoses < 6) {
      setDoses(prev => ({
        ...prev,
        [today]: (prev[today] || 0) + 1
      }));
      toast.success("Dose marcada! ✅");
    } else {
      toast.error("Você já tomou todas as doses de hoje!");
    }
  };

  // Gerar calendário do mês atual
  const generateCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDoses = doses[dateStr] || Math.floor(Math.random() * 7);
      days.push({
        day,
        dateStr,
        doses: dayDoses,
        isToday: dateStr === today
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendar();
  const monthlyStats = {
    totalDays: Object.keys(doses).length + 10, // Simular mais dias
    averageDoses: 4.8,
    completeDays: 22
  };

  return (
    <Layout title="Chá Jaro" breadcrumb={["Home", "Chá Jaro"]}>
      <div className="space-y-8">
        {/* Receita e Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredientes */}
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cup className="w-5 h-5 text-neon-green" />
                Ingredientes
              </CardTitle>
              <Badge variant="outline" className="w-fit border-neon-green/30 text-neon-green">
                Rende 2 litros
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="text-white/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Modo de Preparo */}
          <Card className="bg-dark-bg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-neon-green" />
                Modo de Preparo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {preparationSteps.map((step, index) => (
                  <li key={index} className="flex items-center gap-3 text-white/80">
                    <div className="flex items-center justify-center w-6 h-6 bg-neon-green/20 rounded-full text-neon-green text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="text-neon-green">{step.icon}</div>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios Nutricionais */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Benefícios Nutricionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 py-2">Componente</th>
                    <th className="text-left text-white/80 py-2">Quantidade</th>
                    <th className="text-left text-white/80 py-2">Função</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((benefit, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="text-white py-3">{benefit.component}</td>
                      <td className="text-neon-green py-3">{benefit.quantidade}</td>
                      <td className="text-white/70 py-3">{benefit.funcao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Marcar Dose */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cup className="w-5 h-5 text-neon-green" />
              Progresso de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Doses tomadas: {todayDoses}/6</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((dose) => (
                  <div
                    key={dose}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      dose <= todayDoses
                        ? 'bg-neon-green border-neon-green text-black'
                        : 'border-white/30 text-white/30'
                    }`}
                  >
                    {dose <= todayDoses ? <CheckCircle className="w-4 h-4" /> : dose}
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleMarcarDose}
              className="w-full bg-neon-green text-black hover:bg-neon-green/90"
              disabled={todayDoses >= 6}
            >
              {todayDoses >= 6 ? "Todas as doses de hoje foram tomadas!" : "Marcar Dose de Chá"}
            </Button>
          </CardContent>
        </Card>

        {/* Calendário Interativo */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Calendário Mensal</CardTitle>
            <div className="text-sm text-white/70">
              Clique nos indicadores para marcar/desmarcar doses
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-white/70 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayData, index) => (
                <div key={index} className="aspect-square">
                  {dayData ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className={`w-full h-full rounded-lg border transition-all hover:border-neon-green/50 ${
                            dayData.isToday
                              ? 'bg-neon-green/20 border-neon-green'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="p-1">
                            <div className="text-white text-sm font-medium mb-1">
                              {dayData.day}
                            </div>
                            <div className="flex gap-0.5 justify-center flex-wrap">
                              {[1, 2, 3, 4, 5, 6].map((dose) => (
                                <div
                                  key={dose}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    dose <= dayData.doses
                                      ? 'bg-neon-green'
                                      : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-dark-bg border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Doses do dia {dayData.day}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-white/80">
                            Doses marcadas: {dayData.doses}/6
                          </div>
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5, 6].map((dose) => (
                              <button
                                key={dose}
                                onClick={() => {
                                  setDoses(prev => ({
                                    ...prev,
                                    [dayData.dateStr]: dose <= dayData.doses ? dose - 1 : dose
                                  }));
                                }}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  dose <= dayData.doses
                                    ? 'bg-neon-green border-neon-green text-black'
                                    : 'border-white/30 text-white/30 hover:border-neon-green/50'
                                }`}
                              >
                                {dose}
                              </button>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Mensais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {monthlyStats.completeDays}/30
              </div>
              <div className="text-white/70">Dias completados no mês</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                {monthlyStats.averageDoses}/6
              </div>
              <div className="text-white/70">Média de doses por dia</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-bg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">
                73%
              </div>
              <div className="text-white/70">Taxa de cumprimento mensal</div>
            </CardContent>
          </Card>
        </div>

        {/* Dicas do Nutricionista */}
        <Card className="bg-gradient-to-r from-neon-green/10 to-transparent border-neon-green/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              💡 Dicas do Nutricionista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-white/80">• Tome o Chá Jaro 15 minutos antes das refeições principais</p>
            <p className="text-white/80">• Prefira adoçantes naturais, como stevia</p>
            <p className="text-white/80">• Evite tomar após as 18h para não interferir no sono</p>
            <p className="text-white/80">• Mantenha-se hidratado bebendo água entre as doses</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChaJaro;
