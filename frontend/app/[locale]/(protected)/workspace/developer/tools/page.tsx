"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Binary,
  KeyRound,
  Hash,
  Regex,
  Terminal,
  Clock,
  FileText,
  Globe,
} from "lucide-react";
import { ToolCard } from "../components/ToolCard";

function UUIDGenerator() {
  const [value, setValue] = useState("");
  const generate = () => {
    setValue(crypto.randomUUID());
  };
  const copy = () => navigator.clipboard.writeText(value);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={generate}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm font-medium"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function Base64Tool() {
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const encode = () => {
    try {
      setEncoded(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setEncoded("Invalid input");
    }
  };
  const decode = () => {
    try {
      setInput(decodeURIComponent(escape(atob(encoded))));
    } catch {
      setInput("Invalid base64");
    }
  };
  return (
    <div className="space-y-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Text to encode"
        className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={encode}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-sm"
        >
          Encode
        </button>
        <button
          type="button"
          onClick={decode}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1.5 text-sm"
        >
          Decode
        </button>
      </div>
      {encoded && (
        <output className="block rounded-lg bg-[var(--app-bg)] p-2 font-mono text-xs break-all">
          {encoded}
        </output>
      )}
    </div>
  );
}

const TOOLS: { titleKey: string; description: string; icon: LucideIcon; slot?: "uuid" | "base64" }[] = [
  { titleKey: "uuidGenerator", description: "Generate UUID v4", icon: Hash, slot: "uuid" },
  { titleKey: "base64", description: "Encode / decode Base64", icon: Binary, slot: "base64" },
  { titleKey: "jsonFormatter", description: "Format and validate JSON", icon: Braces },
  { titleKey: "jwtDecoder", description: "Decode JWT payload", icon: KeyRound },
  { titleKey: "regexTester", description: "Test regular expressions", icon: Regex },
  { titleKey: "curlBuilder", description: "Build curl commands", icon: Terminal },
  { titleKey: "timestampConverter", description: "Unix ↔ human date", icon: Clock },
  { titleKey: "markdownPreview", description: "Preview Markdown", icon: FileText },
  { titleKey: "httpStatusHelper", description: "HTTP status codes reference", icon: Globe },
];

export default function ToolsPage() {
  const t = useTranslations("developerWorkspace.tools");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Mini dev utilities: JSON, Base64, JWT, UUID, regex, and more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool, i) => (
          <ToolCard
            key={tool.titleKey}
            titleKey={tool.titleKey}
            description={tool.description}
            icon={tool.icon}
            index={i}
          >
            {tool.slot === "uuid" && <UUIDGenerator />}
            {tool.slot === "base64" && <Base64Tool />}
          </ToolCard>
        ))}
      </div>
    </div>
  );
}
