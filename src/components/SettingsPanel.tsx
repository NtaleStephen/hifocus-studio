"use client";
import { useSettings } from "@/contexts/SettingsContext";
import { themes } from "@/lib/themes";
import { soundOptions, previewSound } from "@/lib/sounds";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Volume2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-lg font-semibold text-foreground">Settings</h2>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Time Display */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Time Display</h3>
            <SettingRow label="24-Hour Format">
              <Switch checked={settings.is24Hour} onCheckedChange={(v) => updateSettings({ is24Hour: v })} />
            </SettingRow>
            <SettingRow label="Show Seconds">
              <Switch checked={settings.showSeconds} onCheckedChange={(v) => updateSettings({ showSeconds: v })} />
            </SettingRow>
            <SettingRow label="Show Date">
              <Switch checked={settings.showDate} onCheckedChange={(v) => updateSettings({ showDate: v })} />
            </SettingRow>
          </section>

          {/* Appearance */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Appearance</h3>
            <SettingRow label="Dark Mode">
              <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
            </SettingRow>
          </section>

          {/* Accent Color */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Accent Color</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateSettings({ theme: t.id })}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                    settings.theme === t.id ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <div className="flex gap-0.5">
                    {t.swatches.map((c, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 first:rounded-l-md last:rounded-r-md ring-1 ring-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Sounds */}
          <section className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sounds</h3>
            <SettingRow label="Hourly Chime">
              <Switch checked={settings.hourlyChime} onCheckedChange={(v) => updateSettings({ hourlyChime: v })} />
            </SettingRow>
            <div>
              <Label className="text-sm text-secondary-foreground mb-2 block">Alert Sound</Label>
              <div className="grid grid-cols-3 gap-2">
                {soundOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateSettings({ alertSound: s.id });
                      if (s.id !== "none") previewSound(s.id);
                    }}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs transition-all ${
                      settings.alertSound === s.id ? "border-primary bg-primary/10" : "border-transparent bg-secondary hover:border-border"
                    }`}
                  >
                    {s.id !== "none" && <Volume2 className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-secondary-foreground">{s.label}</span>
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
    <Label className="text-sm text-secondary-foreground">{label}</Label>
    {children}
  </div>
);

export default SettingsPanel;
