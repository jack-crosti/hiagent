import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Info } from 'lucide-react';
import {
  GlobalCommissionSettings,
  GlobalTier,
  calculateCommission,
  formatNZD,
} from '@/services/commissionService';
import { cn } from '@/lib/utils';

interface Props {
  value: GlobalCommissionSettings;
  onChange: (settings: GlobalCommissionSettings) => void;
  /** If true, renders the live preview calculator below */
  showPreview?: boolean;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function CommissionSettingsEditor({ value, onChange, showPreview = true }: Props) {
  const [previewPrice, setPreviewPrice] = useState(800000);

  // ── Tier helpers ─────────────────────────────────────────────────────────────

  function addTier() {
    const newTier: GlobalTier = {
      id: genId(),
      percentage: 3,
      appliesUpTo: null,
      isBalanceTherafter: true,
    };
    // Insert before existing "balance thereafter" if any, otherwise append
    const tiers = value.tiers.map(t =>
      t.isBalanceTherafter ? { ...t, isBalanceTherafter: false, appliesUpTo: 500000 } : t
    );
    onChange({ ...value, tiers: [...tiers, newTier] });
  }

  function removeTier(id: string) {
    const remaining = value.tiers.filter(t => t.id !== id);
    // Ensure last tier becomes "balance thereafter" if none marked
    if (remaining.length > 0 && !remaining.some(t => t.isBalanceTherafter)) {
      remaining[remaining.length - 1] = {
        ...remaining[remaining.length - 1],
        isBalanceTherafter: true,
        appliesUpTo: null,
      };
    }
    onChange({ ...value, tiers: remaining });
  }

  function updateTier(id: string, patch: Partial<GlobalTier>) {
    let tiers = value.tiers.map(t => (t.id === id ? { ...t, ...patch } : t));

    // If marking as balance-thereafter, clear appliesUpTo and unmark any other
    if (patch.isBalanceTherafter === true) {
      tiers = tiers.map(t =>
        t.id === id
          ? { ...t, isBalanceTherafter: true, appliesUpTo: null }
          : { ...t, isBalanceTherafter: false }
      );
    }
    // If unchecking balance-thereafter on last tier, require an appliesUpTo
    if (patch.isBalanceTherafter === false) {
      tiers = tiers.map(t =>
        t.id === id ? { ...t, isBalanceTherafter: false, appliesUpTo: t.appliesUpTo ?? 500000 } : t
      );
    }

    onChange({ ...value, tiers });
  }

  // ── Validation ────────────────────────────────────────────────────────────────

  const sortedTiers = [...value.tiers].sort((a, b) => {
    if (a.isBalanceTherafter) return 1;
    if (b.isBalanceTherafter) return -1;
    return (a.appliesUpTo ?? Infinity) - (b.appliesUpTo ?? Infinity);
  });

  const tierErrors: Record<string, string> = {};
  let prevCap = 0;
  sortedTiers.forEach((t, i) => {
    if (!t.isBalanceTherafter) {
      const cap = t.appliesUpTo ?? 0;
      if (cap <= prevCap) {
        tierErrors[t.id] = `Must be > ${formatNZD(prevCap)}`;
      }
      prevCap = cap;
    }
    if (t.percentage < 0 || t.percentage > 100) {
      tierErrors[t.id] = (tierErrors[t.id] ? tierErrors[t.id] + '; ' : '') + 'Percentage 0–100';
    }
    if (!t.isBalanceTherafter && i < sortedTiers.length - 1 && sortedTiers[i + 1].isBalanceTherafter === false) {
      // fine
    }
  });

  // Split validation
  const splitTotal = value.agentSplitPct + value.companySplitPct;
  const splitError = Math.abs(splitTotal - 100) > 0.01 ? 'Must total 100%' : '';

  // ── Preview ───────────────────────────────────────────────────────────────────

  const preview = calculateCommission(previewPrice, value);

  return (
    <div className="space-y-6">
      {/* ── Tiers ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Commission Tiers</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Tiered commission is always on. Rate applied to each bracket of the sale price.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTier}>
            <Plus size={14} className="mr-1" /> Add Tier
          </Button>
        </div>

        {value.tiers.length === 0 && (
          <p className="text-xs text-destructive">At least one tier is required.</p>
        )}

        <div className="space-y-2">
          {sortedTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'rounded-lg border border-border bg-muted/20 p-3 space-y-2',
                tierErrors[tier.id] && 'border-destructive/60'
              )}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Percentage */}
                <div className="flex items-center gap-1.5 min-w-[120px]">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={tier.percentage}
                    onChange={e => updateTier(tier.id, { percentage: parseFloat(e.target.value) || 0 })}
                    className="w-20 h-8 text-sm text-center"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>

                {/* Applies up to */}
                {!tier.isBalanceTherafter ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">up to</span>
                    <span className="text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      step={50000}
                      value={tier.appliesUpTo ?? ''}
                      onChange={e => updateTier(tier.id, { appliesUpTo: parseFloat(e.target.value) || null })}
                      className="w-32 h-8 text-sm"
                      placeholder="e.g. 1000000"
                    />
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-xs">Balance thereafter</Badge>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {/* Balance thereafter checkbox – only last non-bt tier can become bt */}
                  {!tier.isBalanceTherafter && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={tier.isBalanceTherafter}
                        onCheckedChange={checked => updateTier(tier.id, { isBalanceTherafter: !!checked })}
                      />
                      Balance thereafter
                    </label>
                  )}
                  {tier.isBalanceTherafter && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={true}
                        onCheckedChange={checked => updateTier(tier.id, { isBalanceTherafter: !!checked })}
                      />
                      Balance thereafter
                    </label>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTier(tier.id)}
                    disabled={value.tiers.length <= 1}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

              {tierErrors[tier.id] && (
                <p className="text-xs text-destructive">{tierErrors[tier.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Minimum Commission ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Minimum Commission</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Applied when tier total falls below this value.</p>
          </div>
          <Switch
            checked={value.applyMinimumCommission}
            onCheckedChange={checked => onChange({ ...value, applyMinimumCommission: checked })}
          />
        </div>

        {value.applyMinimumCommission && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              step={500}
              value={value.minimumCommission}
              onChange={e => onChange({ ...value, minimumCommission: parseFloat(e.target.value) || 0 })}
              className="w-44"
              placeholder="12500"
            />
            <span className="text-xs text-muted-foreground">ex GST</span>
          </div>
        )}
      </div>

      <Separator />

      {/* ── GST ────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">GST</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Added on top of gross commission ex GST. Split figures remain ex GST.</p>
          </div>
          <Switch
            checked={value.addGst}
            onCheckedChange={checked => onChange({ ...value, addGst: checked })}
          />
        </div>

        {value.addGst && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={value.gstRate}
              onChange={e => onChange({ ...value, gstRate: parseFloat(e.target.value) || 0 })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>

      <Separator />

      {/* ── Off-the-top fee info (read-only) ───────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Info size={14} className="text-muted-foreground" />
          Off-the-Top Fee (The Network)
        </div>
        <p className="text-xs text-muted-foreground">
          Min $1,650 or 6% of gross commission ex GST (whichever is greater). No cap.
          Deducted from gross before your split is applied. This is not configurable.
        </p>
      </div>

      <Separator />

      {/* ── Splits ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Agency Split</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Agent %</Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={value.agentSplitPct}
                onChange={e => {
                  const v = parseFloat(e.target.value) || 0;
                  onChange({ ...value, agentSplitPct: v, companySplitPct: 100 - v });
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Company %</Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={value.companySplitPct}
                onChange={e => {
                  const v = parseFloat(e.target.value) || 0;
                  onChange({ ...value, companySplitPct: v, agentSplitPct: 100 - v });
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        {splitError && <p className="text-xs text-destructive">{splitError}</p>}
        {!splitError && (
          <p className="text-xs text-muted-foreground">
            Current: Agent {value.agentSplitPct}% / Company {value.companySplitPct}% (total {splitTotal}%)
          </p>
        )}
      </div>

      <Separator />

      {/* ── Withholding Tax ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Withholding Tax Rate</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            value={value.withholdingRate}
            onChange={e => onChange({ ...value, withholdingRate: parseFloat(e.target.value) || 0 })}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">Deducted from agent share on each deal.</p>
      </div>

      {/* ── Live Preview ────────────────────────────────────────────────────── */}
      {showPreview && (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Live Preview Calculator</Label>
              <p className="text-xs text-muted-foreground mt-0.5">These settings apply across all commission calculations in the app.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sale Price $</span>
              <Input
                type="number"
                min={0}
                step={50000}
                value={previewPrice}
                onChange={e => setPreviewPrice(parseFloat(e.target.value) || 0)}
                className="w-44"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
              <PreviewRow label="Gross commission ex GST" value={preview.gross_commission_excl_gst} />
              {value.addGst && (
                <PreviewRow label={`GST (${value.gstRate}%)`} value={preview.gst_on_commission} sub />
              )}
              {value.addGst && (
                <PreviewRow label="Gross commission incl GST" value={preview.gross_commission_incl_gst} bold />
              )}
              <Separator className="my-1" />
              <PreviewRow label="Off-the-top fee (The Network)" value={preview.on_top_fee} negative />
              <PreviewRow label="After off-the-top fee" value={preview.commission_after_fee} bold />
              <Separator className="my-1" />
              <PreviewRow label={`Agent share (${value.agentSplitPct}%)`} value={preview.user_share_excl_gst} highlight />
              <PreviewRow label={`Company share (${value.companySplitPct}%)`} value={preview.company_share_excl_gst} sub />
              <Separator className="my-1" />
              <PreviewRow label={`Withholding tax (${value.withholdingRate}%)`} value={preview.estimated_tax} negative />
              <PreviewRow label="Net to agent after tax" value={preview.net_to_user_after_tax} bold highlight />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  bold,
  sub,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  sub?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn('flex justify-between', sub && 'pl-4', bold && 'font-semibold')}>
      <span className={cn('text-muted-foreground', highlight && 'text-foreground font-medium')}>{label}</span>
      <span className={cn(
        negative ? 'text-destructive' : highlight ? 'text-primary font-semibold' : 'text-foreground'
      )}>
        {negative ? '−' : ''}{formatNZD(value)}
      </span>
    </div>
  );
}
