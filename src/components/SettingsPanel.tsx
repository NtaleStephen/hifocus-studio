"use client";
import { useSettings } from "@/contexts/SettingsContext";
import { themes, isThemeFree } from "@/lib/themes";
import { soundOptions, previewSound } from "@/lib/sounds";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Volume2, Lock } from "lucide-react";
import { useUpgrade } from "@/contexts/UpgradeContext";
import { canAccess } from "@/lib/features";
import { useTheme } from "next-themes";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

// Shared amber accent so switches match the liquid-glass surface across themes.
const SWITCH_CLASS = "data-[state=checked]:bg-amber-400";

const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { plan, requireFeature } = useUpgrade();
  const canUsePremium = canAccess(plan, "premium-themes");

  const selectTheme = (id: (typeof themes)[number]["id"]) => {
    if (!isThemeFree(id) && !canUsePremium) {
      requireFeature("premium-themes");
      return;
    }
    updateSettings({ theme: id });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Fixed "liquid glass" surface — identical across all themes, always legible. */}
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.14),rgba(12,12,16,0.6)_38%,rgba(12,12,16,0.72))] p-6 text-white shadow-[0_24px_70px_-15px_rgba(0,0,0,0.75)] backdrop-blur-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/70 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Time Display */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-white/50">Time Display</h3>
            <SettingRow label="24-Hour Format">
              <Switch className={SWITCH_CLASS} checked={settings.is24Hour} onCheckedChange={(v) => updateSettings({ is24Hour: v })} />
            </SettingRow>
            <SettingRow label="Show Seconds">
              <Switch className={SWITCH_CLASS} checked={settings.showSeconds} onCheckedChange={(v) => updateSettings({ showSeconds: v })} />
            </SettingRow>
            <SettingRow label="Show Date">
              <Switch className={SWITCH_CLASS} checked={settings.showDate} onCheckedChange={(v) => updateSettings({ showDate: v })} />
            </SettingRow>
          </section>

          {/* Appearance */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-white/50">Appearance</h3>
            <SettingRow label="Dark Mode">
              <Switch className={SWITCH_CLASS} checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </SettingRow>
          </section>

          {/* Accent Color */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-white/50">Accent Color</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {themes.map((t) => {
                const locked = !isThemeFree(t.id) && !canUsePremium;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTheme(t.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                      settings.theme === t.id
                        ? "border-amber-300 bg-white/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    {locked && (
                      <span className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white/80 backdrop-blur">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <div className="flex gap-0.5">
                      {t.swatches.map((c, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 first:rounded-l-md last:rounded-r-md ring-1 ring-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] leading-tight text-white/60">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sounds */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-white/50">Sounds</h3>
            <SettingRow label="Hourly Chime">
              <Switch className={SWITCH_CLASS} checked={settings.hourlyChime} onCheckedChange={(v) => updateSettings({ hourlyChime: v })} />
            </SettingRow>
            <div>
              <Label className="mb-2 block text-sm text-white/80">Alert Sound</Label>
              <div className="grid grid-cols-3 gap-2">
                {soundOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateSettings({ alertSound: s.id });
                      if (s.id !== "none") previewSound(s.id);
                    }}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs transition-all ${
                      settings.alertSound === s.id
                        ? "border-amber-300 bg-white/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {s.id !== "none" && <Volume2 className="h-3 w-3 text-white/50" />}
                    <span className="text-white/80">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <Label className="text-sm text-white/80">{label}</Label>
    {children}
  </div>
);

export default SettingsPanel;
