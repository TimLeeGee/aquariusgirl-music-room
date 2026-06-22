import { Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  SmartPlaylist,
  SmartPlaylistField,
  SmartPlaylistMatch,
  SmartPlaylistOperator,
  SmartPlaylistRule,
  SmartPlaylistSortBy,
} from "../types/playlist";
import { IconButton } from "./IconButton";

type SmartPlaylistEditorDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (
    playlist: Omit<SmartPlaylist, "id" | "createdAt" | "updatedAt" | "type">,
  ) => void;
  onError?: (message: string) => void;
};

const fieldOptions: Array<{ value: SmartPlaylistField; label: string }> = [
  { value: "title", label: "歌曲名稱" },
  { value: "artist", label: "歌手" },
  { value: "album", label: "專輯" },
];

const operatorOptions: Array<{ value: SmartPlaylistOperator; label: string }> = [
  { value: "contains", label: "包含" },
  { value: "equals", label: "等於" },
  { value: "startsWith", label: "開頭是" },
  { value: "endsWith", label: "結尾是" },
];

const sortOptions: Array<{ value: SmartPlaylistSortBy; label: string }> = [
  { value: "title", label: "歌曲名稱" },
  { value: "artist", label: "歌手" },
  { value: "album", label: "專輯" },
];

function createRule(): SmartPlaylistRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    field: "artist",
    operator: "contains",
    value: "",
  };
}

export function SmartPlaylistEditorDialog({
  open,
  onClose,
  onCreate,
  onError,
}: SmartPlaylistEditorDialogProps) {
  const [name, setName] = useState("未命名智慧型播放清單");
  const [match, setMatch] = useState<SmartPlaylistMatch>("all");
  const [rules, setRules] = useState<SmartPlaylistRule[]>(() => [createRule()]);
  const [sortBy, setSortBy] = useState<SmartPlaylistSortBy>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [limitMode, setLimitMode] = useState<"none" | "custom">("none");
  const [limit, setLimit] = useState(25);

  const validRules = useMemo(
    () => rules.filter((rule) => String(rule.value ?? "").trim()),
    [rules],
  );

  if (!open) {
    return null;
  }

  const updateRule = (ruleId: string, nextRule: Partial<SmartPlaylistRule>) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, ...nextRule } : rule,
      ),
    );
  };

  const handleCreate = () => {
    const safeName = name.trim();
    if (!safeName) {
      onError?.("智慧型播放清單需要一個名字。");
      return;
    }

    if (validRules.length === 0) {
      onError?.("請至少設定一條有關鍵字的智慧規則。");
      return;
    }

    onCreate({
      name: safeName,
      match,
      rules: validRules,
      sortBy,
      sortDirection,
      limit: limitMode === "custom" ? Math.max(1, Math.round(limit)) : null,
      parentId: null,
    });
    onClose();
    setName("未命名智慧型播放清單");
    setMatch("all");
    setRules([createRule()]);
    setSortBy("title");
    setSortDirection("asc");
    setLimitMode("none");
    setLimit(25);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-aquarius-navy/[0.72] p-4 backdrop-blur-lg">
      <div className="glass-panel app-no-drag w-full max-w-2xl p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-aquarius-blue">
              Smart Playlist
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              新增智慧型播放清單
            </h2>
          </div>
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="關閉"
            size="sm"
            onClick={onClose}
          />
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-aquarius-mist">
              播放清單名稱
            </span>
            <input
              autoFocus
              value={name}
              className="mt-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-white outline-none focus:border-aquarius-blue/60"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-aquarius-mist">
              符合條件
            </span>
            <select
              value={match}
              className="mt-2 w-full rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-white outline-none focus:border-aquarius-blue/60"
              onChange={(event) => setMatch(event.currentTarget.value as SmartPlaylistMatch)}
            >
              <option value="all">全部符合</option>
              <option value="any">任一符合</option>
            </select>
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-aquarius-mist">規則</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-aquarius-blue/[0.34] bg-aquarius-blue/[0.12] px-3 py-2 text-xs font-bold text-white"
                onClick={() => setRules((current) => [...current, createRule()])}
              >
                <Plus className="h-4 w-4" />
                新增規則
              </button>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-white/[0.12] bg-white/[0.06] p-2 sm:grid-cols-[1fr_1fr_1.5fr_auto]"
                >
                  <select
                    value={rule.field}
                    className="rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-sm text-white"
                    onChange={(event) =>
                      updateRule(rule.id, { field: event.currentTarget.value as SmartPlaylistField })
                    }
                  >
                    {fieldOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    className="rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-sm text-white"
                    onChange={(event) =>
                      updateRule(rule.id, {
                        operator: event.currentTarget.value as SmartPlaylistOperator,
                      })
                    }
                  >
                    {operatorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={String(rule.value)}
                    placeholder="請輸入關鍵字"
                    className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white outline-none placeholder:text-aquarius-mist/70 focus:border-aquarius-blue/60"
                    onChange={(event) => updateRule(rule.id, { value: event.currentTarget.value })}
                  />
                  <IconButton
                    icon={<Trash2 className="h-4 w-4" />}
                    label="移除規則"
                    size="sm"
                    variant="danger"
                    disabled={rules.length === 1}
                    onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm font-bold text-aquarius-mist">排序</span>
              <select
                value={sortBy}
                className="mt-2 w-full rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-white"
                onChange={(event) => setSortBy(event.currentTarget.value as SmartPlaylistSortBy)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold text-aquarius-mist">方向</span>
              <select
                value={sortDirection}
                className="mt-2 w-full rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-white"
                onChange={(event) => setSortDirection(event.currentTarget.value as "asc" | "desc")}
              >
                <option value="asc">A 到 Z</option>
                <option value="desc">Z 到 A</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm font-bold text-aquarius-mist">最多顯示</span>
              <select
                value={limitMode}
                className="mt-2 w-full rounded-lg border border-white/[0.12] bg-aquarius-navy/[0.88] px-3 py-2 text-white"
                onChange={(event) => setLimitMode(event.currentTarget.value as "none" | "custom")}
              >
                <option value="none">不限制</option>
                <option value="custom">自訂數量</option>
              </select>
            </label>
            {limitMode === "custom" && (
              <label>
                <span className="text-sm font-bold text-aquarius-mist">數量</span>
                <input
                  type="number"
                  min={1}
                  value={limit}
                  className="mt-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-white outline-none focus:border-aquarius-blue/60"
                  onChange={(event) => setLimit(Number(event.currentTarget.value))}
                />
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-bold text-aquarius-mist"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-lg border border-aquarius-blue/[0.55] bg-aquarius-blue/[0.18] px-4 py-2 text-sm font-black text-white shadow-glow"
            onClick={handleCreate}
          >
            建立
          </button>
        </div>
      </div>
    </div>
  );
}
