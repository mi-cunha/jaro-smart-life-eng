
interface DashboardHeaderProps {}

export function DashboardHeader({}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá! Bem-vindo ao <span className="text-neon-green">JaroSmart</span> 👋
        </h1>
        <p className="text-white/70">Sua jornada de emagrecimento inteligente</p>
      </div>
    </div>
  );
}
