
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Bell, Shield, Link as LinkIcon, Save } from "lucide-react";
import { useRef } from "react";
import { useSupabasePerfil } from "@/hooks/useSupabasePerfil";

const Perfil = () => {
  const { perfil, loading, atualizarPerfil, salvarAvatar } = useSupabasePerfil();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </Layout>
    );
  }

  if (!perfil) {
    return (
      <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Erro ao carregar perfil</div>
        </div>
      </Layout>
    );
  }

  const handleSalvarConfiguracao = () => {
    // Dados já são salvos automaticamente quando alterados
    // Este botão pode servir para feedback visual
  };

  const handleTogglePreferencia = async (preferencia: string) => {
    await atualizarPerfil({
      [preferencia]: !perfil[preferencia as keyof typeof perfil]
    });
  };

  const handleToggleNotificacao = async (notificacao: string) => {
    await atualizarPerfil({
      [notificacao]: !perfil[notificacao as keyof typeof perfil]
    });
  };

  const handleToggleIntegracao = async (integracao: string) => {
    await atualizarPerfil({
      [integracao]: !perfil[integracao as keyof typeof perfil]
    });
  };

  const handleChangeObjetivo = async (objetivo: string, valor: string) => {
    await atualizarPerfil({
      [objetivo]: parseFloat(valor) || 0
    });
  };

  const handleChangeNome = async (nome: string) => {
    await atualizarPerfil({ nome });
  };

  const handleChangeAlergias = async (alergias: string) => {
    await atualizarPerfil({ alergias });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await salvarAvatar(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Layout title="Perfil & Configurações" breadcrumb={["Home", "Perfil"]}>
      <div className="space-y-8">
        {/* Informações Pessoais */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-neon-green" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={perfil.avatar_url} />
                  <AvatarFallback className="bg-neon-green/20 text-neon-green text-2xl">
                    {perfil.nome.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  onClick={handleCameraClick}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon-green text-black hover:bg-neon-green/90"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Foto do perfil</h3>
                <p className="text-white/60 text-sm">Clique no ícone da câmera para alterar sua foto</p>
              </div>
            </div>

            {/* Campos de edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white/80">Nome</Label>
                <Input
                  id="nome"
                  value={perfil.nome}
                  onChange={(e) => handleChangeNome(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">E-mail</Label>
                <Input
                  id="email"
                  value={perfil.email || ''}
                  disabled
                  className="bg-white/5 border-white/20 text-white/60"
                />
                <p className="text-xs text-white/50">O e-mail não pode ser alterado</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
            >
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Preferências Alimentares */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Preferências Alimentares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { key: 'vegano', label: 'Vegano' },
                { key: 'vegetariano', label: 'Vegetariano' },
                { key: 'low_carb', label: 'Low Carb' },
                { key: 'sem_gluten', label: 'Sem Glúten' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={perfil[key as keyof typeof perfil] as boolean}
                    onCheckedChange={() => handleTogglePreferencia(key)}
                    className="data-[state=checked]:bg-neon-green data-[state=checked]:border-neon-green"
                  />
                  <Label className="text-white/80">{label}</Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alergias" className="text-white/80">Histórico de Alergias</Label>
              <Textarea
                id="alergias"
                value={perfil.alergias || ''}
                onChange={(e) => handleChangeAlergias(e.target.value)}
                placeholder="Ex: Lactose, amendoim, frutos do mar..."
                className="bg-white/5 border-white/20 text-white min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Objetivos & Metas */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Objetivos & Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pesoObjetivo" className="text-white/80">Peso Objetivo (kg)</Label>
                <Input
                  id="pesoObjetivo"
                  type="number"
                  value={perfil.peso_objetivo || ''}
                  onChange={(e) => handleChangeObjetivo('peso_objetivo', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="habitosDiarios" className="text-white/80">Meta de Hábitos Diários</Label>
                <Input
                  id="habitosDiarios"
                  type="number"
                  value={perfil.habitos_diarios}
                  onChange={(e) => handleChangeObjetivo('habitos_diarios', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosesCha" className="text-white/80">Meta de Doses do Chá (por dia)</Label>
                <Input
                  id="dosesCha"
                  type="number"
                  value={perfil.doses_cha}
                  onChange={(e) => handleChangeObjetivo('doses_cha', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caloriasDiarias" className="text-white/80">Meta de Calorias Diárias</Label>
                <Input
                  id="caloriasDiarias"
                  type="number"
                  value={perfil.calorias_diarias}
                  onChange={(e) => handleChangeObjetivo('calorias_diarias', e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-neon-green" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: 'notif_tomar_cha', label: 'Lembrete para tomar Chá Jaro', desc: 'Antes das principais refeições' },
              { key: 'notif_marcar_habito', label: 'Lembrete para marcar hábitos', desc: 'Diariamente às 20:00' },
              { key: 'notif_gerar_receitas', label: 'Sugestão para gerar receitas', desc: 'Domingos às 10:00' },
              { key: 'notif_comprar_itens', label: 'Lembrete para comprar itens', desc: 'Quando lista estiver vazia' },
              { key: 'notif_atingir_meta', label: 'Notificação ao atingir meta de peso', desc: 'Quando objetivos forem alcançados' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{label}</div>
                  <div className="text-white/60 text-sm">{desc}</div>
                </div>
                <Switch
                  checked={perfil[key as keyof typeof perfil] as boolean}
                  onCheckedChange={() => handleToggleNotificacao(key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-neon-green" />
              Integrações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: 'google_fit', label: 'Google Fit' },
              { key: 'apple_health', label: 'Apple Health' },
              { key: 'fitbit', label: 'Fitbit' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neon-green/20 rounded-lg flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-white/60 text-sm">
                      {perfil[key as keyof typeof perfil] ? 'Conectado' : 'Não conectado'}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleIntegracao(key)}
                  variant={perfil[key as keyof typeof perfil] ? "outline" : "default"}
                  className={perfil[key as keyof typeof perfil] 
                    ? "border-red-400/30 text-red-400 hover:bg-red-400/10" 
                    : "bg-neon-green text-black hover:bg-neon-green/90"
                  }
                >
                  {perfil[key as keyof typeof perfil] ? 'Desconectar' : 'Conectar'}
                </Button>
              </div>
            ))}

            <Separator className="bg-white/10" />

            {/* OAuth */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Autenticação Social</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <div className="w-5 h-5 mr-2 bg-white rounded" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <div className="w-5 h-5 mr-2 bg-blue-600 rounded" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <div className="w-5 h-5 mr-2 bg-black rounded" />
                  Apple
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="sticky bottom-6 z-10">
          <Button
            onClick={handleSalvarConfiguracao}
            className="w-full bg-neon-green text-black hover:bg-neon-green/90 text-lg py-6"
          >
            <Save className="w-5 h-5 mr-2" />
            Configurações Salvas Automaticamente
          </Button>
        </div>

        {/* Seção de Privacidade */}
        <Card className="bg-dark-bg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-green" />
              Privacidade & Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Dados de Uso</div>
                <div className="text-white/60 text-sm">Permitir coleta anônima para melhorias</div>
              </div>
              <Switch 
                checked={perfil.dados_uso}
                onCheckedChange={() => handleToggleNotificacao('dados_uso')}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Notificações Push</div>
                <div className="text-white/60 text-sm">Receber notificações no dispositivo</div>
              </div>
              <Switch 
                checked={perfil.notificacoes_push}
                onCheckedChange={() => handleToggleNotificacao('notificacoes_push')}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Baixar Meus Dados
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Perfil;
