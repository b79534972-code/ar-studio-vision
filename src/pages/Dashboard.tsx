import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Layout, Package, LogOut, Plus, Edit, Flame } from "lucide-react";

const recentLayouts = [
  { id: 1, name: "Studio Layout A", date: "Feb 18, 2026", color: "from-primary/20 to-accent" },
  { id: 2, name: "Bedroom Config", date: "Feb 15, 2026", color: "from-accent to-secondary" },
  { id: 3, name: "Living Room v2", date: "Feb 10, 2026", color: "from-secondary to-primary/10" },
];

const savedProducts = [
  { id: 1, name: "Modern Sofa", dimensions: "180 × 80 × 75 cm" },
  { id: 2, name: "Coffee Table", dimensions: "90 × 50 × 45 cm" },
  { id: 3, name: "Bookshelf", dimensions: "80 × 30 × 180 cm" },
  { id: 4, name: "Floor Lamp", dimensions: "40 × 40 × 160 cm" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <Link to="/" className="font-display text-xl font-bold text-foreground tracking-tight">
            InteriorAR<span className="text-primary">.</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Layout className="w-4 h-4" /> Dashboard
            </Link>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5">
              <Package className="w-4 h-4" /> My Layouts
            </button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 space-y-10">
        {/* Start new AR session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-2xl p-8 text-center shadow-elevated"
        >
          <h2 className="font-display text-2xl font-bold text-primary-foreground mb-2">
            Ready to design?
          </h2>
          <p className="text-primary-foreground/80 text-sm mb-6">
            Launch a new AR session to place furniture in your room
          </p>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => navigate("/ar-demo")}
            className="gap-2"
          >
            <Flame className="w-5 h-5" />
            Start New AR Session
          </Button>
        </motion.div>

        {/* Recent Layouts */}
        <section>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Layouts</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLayouts.map((layout, i) => (
              <motion.div
                key={layout.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden group hover:shadow-elevated transition-shadow"
              >
                <div className={`h-32 bg-gradient-to-br ${layout.color}`} />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{layout.name}</p>
                    <p className="text-xs text-muted-foreground">{layout.date}</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Saved Products */}
        <section>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Saved Products</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-card rounded-xl border border-border/50 shadow-card p-4 hover:shadow-elevated transition-shadow"
              >
                <div className="w-full aspect-square bg-secondary/60 rounded-lg mb-3 flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="font-medium text-foreground text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.dimensions}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
