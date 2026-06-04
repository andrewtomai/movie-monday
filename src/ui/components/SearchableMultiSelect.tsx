import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/components/ui/combobox'

interface SearchableMultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}: SearchableMultiSelectProps) {
  return (
    <Combobox
      items={options}
      multiple
      value={selected}
      onValueChange={onChange}
    >
      <ComboboxChips>
        <ComboboxValue>
          {selected.map((name) => (
            <ComboboxChip key={name}>{name}</ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput placeholder={placeholder} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No matches found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
