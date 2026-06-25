import { LANGUAGES } from "@/lib/languages";
import { FormSelect } from "@/components/form-select";

const OPTIONS = LANGUAGES.map((l) => ({ value: l.code, label: l.name }));

export function LanguageSelect({
  name = "language",
  defaultValue = "en",
  id,
}: {
  name?: string;
  defaultValue?: string;
  id?: string;
}) {
  return <FormSelect name={name} id={id} defaultValue={defaultValue} options={OPTIONS} placeholder="Language" />;
}
