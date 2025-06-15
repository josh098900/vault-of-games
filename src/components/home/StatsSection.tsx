
export const StatsSection = () => {
  return (
    <section className="py-16 px-4 bg-card/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2 animate-fade-in-up">
            <div className="text-3xl font-bold text-primary animate-counter">50K+</div>
            <div className="text-sm text-muted-foreground">Games Tracked</div>
          </div>
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl font-bold text-green-400 animate-counter">25K+</div>
            <div className="text-sm text-muted-foreground">Active Gamers</div>
          </div>
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold text-pink-400 animate-counter">100K+</div>
            <div className="text-sm text-muted-foreground">Reviews Written</div>
          </div>
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl font-bold text-purple-400 animate-counter">500K+</div>
            <div className="text-sm text-muted-foreground">Hours Logged</div>
          </div>
        </div>
      </div>
    </section>
  );
};
