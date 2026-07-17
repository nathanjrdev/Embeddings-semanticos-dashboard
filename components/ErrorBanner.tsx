export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="glass-panel border-white/[0.15] px-5 py-4 animate-fade-in">
      <p className="label-eyebrow text-base-300 mb-1">Erro no processamento</p>
      <p className="text-sm text-base-200">{message}</p>
    </div>
  );
}
