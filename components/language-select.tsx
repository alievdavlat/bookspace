import { LANGUAGES } from "@/lib/languages";

const fieldClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function LanguageSelect({
  name = "language",
  defaultValue = "en",
  id,
}: {
  name?: string;
  defaultValue?: string;
  id?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={fieldClass}>
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
